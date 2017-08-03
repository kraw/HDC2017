import Foundation

class Map {

  var identifier:String!
  var name:String!
  var uuid:UUID!
  var beacons = [Beacon]()

  init(withUUID uuid:UUID, identifier:String, name:String) {
    self.uuid = uuid
    self.identifier = identifier
    self.name = name
  }
  
}
