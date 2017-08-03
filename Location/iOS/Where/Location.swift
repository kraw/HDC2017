import Foundation

class Location {

  var name:String!
  var major:NSNumber
  var minor:NSNumber
  
  init(withMajor major:NSNumber, minor:NSNumber, name:String) {
    self.major = major
    self.minor = minor
    self.name = name
  }
  
}
