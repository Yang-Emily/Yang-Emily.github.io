import Foundation
import Vision
import CoreImage
import AppKit
func process(_ input: String, _ output: String) {
let image = CIImage(contentsOf: URL(fileURLWithPath: input))!
let handler = VNImageRequestHandler(ciImage: image, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
do {
 try handler.perform([request])
 guard let result = request.results?.first else { fatalError("No foreground") }
 let mask = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
 let alpha = CIImage(cvPixelBuffer: mask)
 let clear = CIImage(color: .clear).cropped(to: image.extent)
 let cut = image.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey:clear,kCIInputMaskImageKey:alpha])
 let context = CIContext()
 try context.writePNGRepresentation(of: cut, to: URL(fileURLWithPath:output), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
 print("masked \(result.allInstances.count) instances")
} catch { print(error); exit(1) }

}
let input = CommandLine.arguments[1], output = CommandLine.arguments[2]
var isDirectory: ObjCBool = false
if FileManager.default.fileExists(atPath:input, isDirectory:&isDirectory), isDirectory.boolValue {
 try FileManager.default.createDirectory(atPath:output, withIntermediateDirectories:true)
 for name in try FileManager.default.contentsOfDirectory(atPath:input).sorted() where name.hasSuffix(".png") { autoreleasepool { process(input + "/" + name, output + "/" + name) }; print(name) }
} else { process(input, output) }
