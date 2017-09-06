import Foundation
import ObjectMapper

class Beacon:Mappable {

  var label:String?
  var name:String?
  var major:NSNumber?
  var minor:NSNumber?
  
  required init?(map: Map) {}
  
  func mapping(map: Map) {
    name <- map["name"]
    major <- map["major"]
    minor <- map["minor"]
    label <- map["label"]
  }
  
}
