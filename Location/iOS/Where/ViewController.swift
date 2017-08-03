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
          // Which beacon
          for location in map.beacons {
            if location.minor == beacon.minor {
              lblLocation.text = location.name
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
