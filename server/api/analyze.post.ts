import { readMultipartFormData } from 'h3'
import { bufferToMat, matToBase64, computeHuMoments, orderPoints } from '../utils/opencvNode'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No image file uploaded' })
  }

  const fileData = formData[0].data
  let src: any = null
  let cv: any = null

  try {
    const res = await bufferToMat(fileData)
    src = res.mat
    cv = res.cv
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: 'Failed to decode image file' })
  }

  const mats: any[] = []
  const stepImages: string[] = []
  
  const cleanup = () => {
    mats.forEach(m => { try { m.delete() } catch {} })
    try { src.delete() } catch {}
  }

  try {
    const A4_AREA_CM2 = 21 * 29.7 // 623.7 cm²

    // Step 0 - Original
    stepImages.push(await matToBase64(src))

    // Step 1 - Grayscale
    const gray = new cv.Mat(); mats.push(gray)
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
    stepImages.push(await matToBase64(gray))

    // Step 2 - Canny Edge Detection (with Gaussian Blur)
    const blurred = new cv.Mat(); mats.push(blurred)
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)
    const edged = new cv.Mat(); mats.push(edged)
    cv.Canny(blurred, edged, 75, 200)
    stepImages.push(await matToBase64(edged))

    // Step 3 - Morphological Ops (Close gaps in edges)
    const morphed = new cv.Mat(); mats.push(morphed)
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5)); mats.push(kernel)
    cv.morphologyEx(edged, morphed, cv.MORPH_CLOSE, kernel)
    stepImages.push(await matToBase64(morphed))

    // Step 4 - Paper Contour
    const contours = new cv.MatVector(); mats.push(contours)
    const hierarchy = new cv.Mat(); mats.push(hierarchy)
    cv.findContours(morphed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    // Build sorted contour list
    const cList: { idx: number; area: number; corners: number; rect: any; solidity: number; approx: any }[] = []
    for (let i = 0; i < contours.size(); i++) {
      const c = contours.get(i)
      const area = cv.contourArea(c)
      if (area < 5000) { c.delete(); continue } // Paper must be somewhat large
      
      const approx = new cv.Mat()
      cv.approxPolyDP(c, approx, 0.02 * cv.arcLength(c, true), true)
      
      const rect = cv.boundingRect(c)
      const hull = new cv.Mat()
      cv.convexHull(c, hull, false, true)
      const hullArea = cv.contourArea(hull)
      const solidity = hullArea > 0 ? area / hullArea : 0
      
      cList.push({ idx: i, area, corners: approx.rows, rect, solidity, approx: approx.clone() })
      approx.delete(); hull.delete(); c.delete()
    }
    cList.sort((a, b) => b.area - a.area)

    // Find Document (A4) - Largest 4 point polygon
    let docContour: any = null
    let docApprox: any = null
    for (const item of cList) {
      if (item.corners === 4 && item.solidity > 0.8) {
        docContour = contours.get(item.idx)
        docApprox = item.approx
        break
      }
    }

    if (!docContour) {
      // Cleanup cloned approx matrices before throwing
      cList.forEach(item => item.approx.delete())
      throw createError({ statusCode: 400, statusMessage: 'Could not detect an A4 paper in the image. Please make sure the 4 corners of the paper are clearly visible on a contrasting background.' })
    }

    const docVis = src.clone(); mats.push(docVis)
    const sv = new cv.MatVector(); sv.push_back(docContour)
    cv.drawContours(docVis, sv, 0, new cv.Scalar(255, 0, 0, 255), 4)
    stepImages.push(await matToBase64(docVis))
    sv.delete(); docContour.delete()

    // Extract the 4 points
    const points = []
    for (let i = 0; i < 4; i++) {
      points.push({ x: docApprox.data32S[i * 2], y: docApprox.data32S[i * 2 + 1] })
    }
    const orderedPts = orderPoints(points)

    // Step 5 - Perspective Warp
    // Check if the detected paper is landscape or portrait to avoid squishing the UI
    const topWidth = Math.hypot(orderedPts[1].x - orderedPts[0].x, orderedPts[1].y - orderedPts[0].y)
    const leftHeight = Math.hypot(orderedPts[3].x - orderedPts[0].x, orderedPts[3].y - orderedPts[0].y)
    
    let maxWidth = 700
    let maxHeight = 990 // A4 ratio ~1.414
    
    if (topWidth > leftHeight) {
      maxWidth = 990
      maxHeight = 700
    }

    const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
      orderedPts[0].x, orderedPts[0].y, // Top-Left
      orderedPts[1].x, orderedPts[1].y, // Top-Right
      orderedPts[2].x, orderedPts[2].y, // Bottom-Right
      orderedPts[3].x, orderedPts[3].y  // Bottom-Left
    ]); mats.push(srcCoords)

    const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      maxWidth - 1, 0,
      maxWidth - 1, maxHeight - 1,
      0, maxHeight - 1
    ]); mats.push(dstCoords)

    const M = cv.getPerspectiveTransform(srcCoords, dstCoords); mats.push(M)
    const warped = new cv.Mat(); mats.push(warped)
    cv.warpPerspective(src, warped, M, new cv.Size(maxWidth, maxHeight))
    stepImages.push(await matToBase64(warped))

    // Step 6 - Warped Thresholding (Find Leaf)
    const warpedGray = new cv.Mat(); mats.push(warpedGray)
    cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY)
    
    const warpedBinary = new cv.Mat(); mats.push(warpedBinary)
    // Use Adaptive Thresholding to completely ignore shadows and lighting gradients on the A4 paper
    cv.adaptiveThreshold(warpedGray, warpedBinary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 99, 5)
    
    const leafMorphed = new cv.Mat(); mats.push(leafMorphed)
    const leafKernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(9, 9)); mats.push(leafKernel)
    cv.morphologyEx(warpedBinary, leafMorphed, cv.MORPH_CLOSE, leafKernel)
    
    // Draw a thick black border to erase any table edges that leaked into the warp
    cv.rectangle(leafMorphed, new cv.Point(0, 0), new cv.Point(maxWidth, maxHeight), new cv.Scalar(0, 0, 0, 0), 20)
    
    stepImages.push(await matToBase64(leafMorphed))

    // Step 7 - Leaf Contour
    const leafContours = new cv.MatVector(); mats.push(leafContours)
    const leafHierarchy = new cv.Mat(); mats.push(leafHierarchy)
    cv.findContours(leafMorphed, leafContours, leafHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let leafArea = 0
    let leafIdx = -1
    for (let i = 0; i < leafContours.size(); i++) {
      const c = leafContours.get(i)
      const area = cv.contourArea(c)
      const rect = cv.boundingRect(c)
      c.delete()

      // Skip contours that touch the extreme edges (these are usually shadows or background leaks)
      // Since we drew a 20px black border, any edge leak will start at x=20. So we check against 25.
      const touchesEdge = rect.x <= 25 || rect.y <= 25 || rect.x + rect.width >= maxWidth - 25 || rect.y + rect.height >= maxHeight - 25

      if (!touchesEdge && area > leafArea) {
        leafArea = area
        leafIdx = i
      }
    }

    if (leafIdx === -1 || leafArea < 500) {
      cList.forEach(item => item.approx.delete())
      throw createError({ statusCode: 400, statusMessage: 'Could not detect the leaf ON the paper. Make sure the leaf is clearly visible and not touching the edges of the A4 paper.' })
    }

    const finalVis = warped.clone(); mats.push(finalVis)
    const lv = new cv.MatVector(); lv.push_back(leafContours.get(leafIdx))
    // Draw leaf contour in BLUE (0, 0, 255, 255)
    cv.drawContours(finalVis, lv, 0, new cv.Scalar(0, 0, 255, 255), 4)
    stepImages.push(await matToBase64(finalVis)) // Step 7 - Leaf Contour

    // Step 8 - Area Calculation
    // Warped image is exactly A4 size.
    const refPixelArea = maxWidth * maxHeight
    const scaleFactor = A4_AREA_CM2 / refPixelArea
    const leafAreaCm2 = leafArea * scaleFactor

    const areaVis = finalVis.clone(); mats.push(areaVis)
    // Draw the calculated area on the final visualization
    cv.putText(areaVis, `${leafAreaCm2.toFixed(2)} cm2`, new cv.Point(30, 50), cv.FONT_HERSHEY_SIMPLEX, 1.2, new cv.Scalar(0, 255, 0, 255), 3)
    stepImages.push(await matToBase64(areaVis)) // Step 8 - Area Calculation

    const leafMask = cv.Mat.zeros(warped.rows, warped.cols, cv.CV_8UC1); mats.push(leafMask)
    cv.drawContours(leafMask, lv, 0, new cv.Scalar(255), -1)
    const huMoments = computeHuMoments(cv.moments(leafMask))
    lv.delete()

    const lc = leafContours.get(leafIdx)
    const contourData: number[][] = []
    for (let i = 0; i < lc.rows; i++) contourData.push([lc.data32S[i * 2], lc.data32S[i * 2 + 1]])

    cList.forEach(item => item.approx.delete())

    return {
      success: true,
      result: {
        areaCm2: leafAreaCm2,
        huMoments,
        contourData,
        leafPixelArea: leafArea,
        referencePixelArea: refPixelArea
      },
      stepImages
    }
  } catch (e: any) {
    // Return 200 OK with success=false so the frontend can still display the partial stepImages
    return {
      success: false,
      error: e.statusMessage || e.message || 'Analysis failed',
      stepImages
    }
  } finally {
    cleanup()
  }
})
