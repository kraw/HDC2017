import Alamofire
import AlamofireObjectMapper
import CoreLocation
import SwiftyJSON
import UIKit

class ViewController: UIViewController, CLLocationManagerDelegate {
  
  @IBOutlet weak var lblLocation: UILabel!
  
  let CONFIGURATION_PATH = Bundle.main.path(forResource:"Config", ofType: "plist")
  
  var config:NSDictionary!
  
  var floorplan:Floorplan!
  
  var region: CLBeaconRegion!
  var manager: CLLocationManager!
  
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
    
    // Load default map
    let path =
      (config.value(forKey: "BluemixPath") as? String)! +
      (config.value(forKey: "MapPath") as? String)! + "/" +
      (config.value(forKey: "DefaultMap") as? String)!  
    Alamofire.request(path).responseObject { (response: DataResponse<Floorplan>) in
      self.floorplan = response.result.value
      print("\(self.floorplan.name!).")
      
      // Beacon region to monitor
      self.region = CLBeaconRegion(
        proximityUUID: UUID(uuidString: self.floorplan.uuid!)!,
        identifier: self.floorplan.identifier!
      )
      self.region.notifyOnEntry = true
      self.region.notifyOnExit = true
      
      // Start monitoring for beacons
      self.manager.startMonitoring(for: self.region)
      self.manager.startRangingBeacons(in: self.region)
    }
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
          for location in floorplan.beacons! {
            // Found match
            if location.minor! == beacon.minor {
              // Only update if different
              if lblLocation.text != location.name! {
                // Change label
                lblLocation.text = location.name!
                
                // Headers
                let user: String = (config.value(forKey: "WatsonApplication") as? String)!
                let password: String = (config.value(forKey: "WatsonToken") as? String)!
                var headers: HTTPHeaders = [:]
                
                if let auth = Request.authorizationHeader(user: user, password: password ) {
                  headers[auth.key] = auth.value
                }
                
                // Broadcast location
                let message: Parameters = [
                  "major": location.major!.intValue,
                  "minor": location.minor!.intValue,
                  "name": location.name!,
                  "label": location.label!,
                  "document": floorplan.document!
                ]
                
                // Send notification
                let url: String =
                  (config.value(forKey: "WatsonHost") as? String)! +
                  (config.value(forKey: "BeaconTopic") as? String)!
                _ = Alamofire.request(
                  url,
                  method: .post,
                  parameters: message,
                  encoding: JSONEncoding.default,
                  headers: headers
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
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
}
