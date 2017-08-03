import CoreLocation
import SwiftyJSON
import UIKit

class ViewController: UIViewController, CLLocationManagerDelegate, CloudantDelegate {
  
  @IBOutlet weak var lblLocation: UILabel!
  
  let CONFIGURATION_PATH = Bundle.main.path(forResource:"Config", ofType: "plist")
  
  var config:NSDictionary!
  
  var map:Map!
  
  var region: CLBeaconRegion!
  var manager: CLLocationManager!
  
  var cloudant:Cloudant!
  var watson:WatsonIoT!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configuration from property list
    config = NSDictionary(contentsOfFile: CONFIGURATION_PATH!)

    // Clear and hide label
    lblLocation.text = ""
    lblLocation.isHidden = true
    
    // Location manager to watch for beacons
    manager = CLLocationManager()
    manager.delegate = self
    
    // Request authorization
    manager.requestWhenInUseAuthorization()
    
    // Connect to Watson IoT
    watson = WatsonIoT(
      withClientId: "a:ts200f:abc123",
      host: (config.value(forKey: "WatsonHost") as? String)!,
      port: NSNumber(value: (config.value(forKey: "WatsonPort") as? Int)!)
    )
    watson.connect(
      username: (config.value(forKey: "WatsonApplication") as? String)!,
      password: (config.value(forKey: "WatsonToken") as? String)!
    )
    
    // Load map from database
    cloudant = Cloudant(
      forDatabase: (config.value(forKey: "CloudantDatabase") as? String)!,
      key: (config.value(forKey: "CloudantKey") as? String)!,
      password: (config.value(forKey: "CloudantPassword") as? String)!
    )
    cloudant.delegate = self
    cloudant.read(
      document: (config.value(forKey: "DefaultMap") as? String)!
    )
  }
  
  // Found or lost beacons
  func locationManager(_ manager: CLLocationManager, didRangeBeacons beacons: [CLBeacon], in region: CLBeaconRegion) {
    // More than one is possible
    if beacons.count > 0 {
      // See which is closest
      for beacon in beacons {
        // Beacon that is really close
        if beacon.proximity == CLProximity.near {
          // Look for match from database
          for location in map.beacons {
            // Found match
            if location.minor == beacon.minor {
              // Only update if different
              if lblLocation.text != location.name {
                // Change label
                lblLocation.text = location.name
                
                // Broadcast location
                let message = JSON([
                  "major": location.major,
                  "minor": location.minor,
                  "name": location.name
                ])
                watson.publish(
                  topic: "iot-2/type/Beacon/id/IBM/evt/beacon/fmt/json",
                  message: message.rawString()!
                )
              }
            }
          }
          
          lblLocation.isHidden = false
        }
      }
    } else {
      // Hide and clean up
      lblLocation.text = ""
      lblLocation.isHidden = true
    }
  }
  
  // Map read from database
  func didRead(document:JSON) {
    print(document)
    
    // Map
    self.map = Map(
      withUUID: UUID(uuidString: document["uuid"].stringValue)!,
      identifier: document["identifier"].stringValue,
      name: document["name"].stringValue
    )
    
    // Locations in map
    for (_, beacon) in document["beacons"] {
      map.beacons.append(Beacon(
        withMajor: NSNumber(value: beacon["major"].intValue),
        minor: NSNumber(value: beacon["minor"].intValue),
        name: beacon["name"].stringValue
      ) )
    }
    
    // Beacon region to monitor
    region = CLBeaconRegion(
      proximityUUID: self.map.uuid,
      identifier: self.map.identifier
    )
    region.notifyOnEntry = true
    region.notifyOnExit = true
    
    // Start monitoring for beacons
    manager.startMonitoring(for: region)
    manager.startRangingBeacons(in: region)
  }
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
}
