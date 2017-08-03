import Foundation
import SwiftyJSON

class Cloudant {
  
  weak var delegate:CloudantDelegate?
  
  var db:String!
  var key:String!
  var password:String!
  
  init(forDatabase db:String, key:String, password:String) {
    self.db = db
    self.key = key
    self.password = password
  }
  
  func read(document:String) {
    let path = "\(db!)/\(document)"
    let url = URL(string: path)
    let request: URLRequest = URLRequest(url: url!);
    
    let pairing = "\(key!):\(password!)".data(using: .utf8)
    let encoded = pairing!.base64EncodedString(
      options: Data.Base64EncodingOptions.init(rawValue: 0)
    )
    let authentication = "Basic \(encoded)"
    
    let config = URLSessionConfiguration.default
    config.httpAdditionalHeaders = ["Authorization": authentication]
    
    let session = URLSession(
      configuration: config,
      delegate: self as? URLSessionDelegate,
      delegateQueue: OperationQueue()
    )
    
    let task = session.dataTask(with: request as URLRequest) { (data, response, error) -> Void in
      let json = JSON(data: data!)
      self.delegate?.didRead(document: json)
    }
    
    task.resume()
  }

}

protocol CloudantDelegate: class {
  func didRead(document:JSON)
}
