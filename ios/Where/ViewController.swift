import Alamofire
import AlamofireObjectMapper
import CoreLocation
import SwiftyJSON
import UIKit

class ViewController: UIViewController, CLLocationManagerDelegate {
  
  @IBOutlet weak var lblUUID: UILabel!
  @IBOutlet weak var lblMajor: UILabel!
  @IBOutlet weak var lblMinor: UILabel!
  @IBOutlet weak var boxMajor: UIView!
  @IBOutlet weak var boxMinor: UIView!
  
  let CONFIGURATION_PATH = Bundle.main.path(forResource:"Config", ofType: "plist")
  
  var config:NSDictionary!
  
  var floorplan:Floorplan!
  
  var region: CLBeaconRegion!
  var manager: CLLocationManager!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configuration from property list
    config = NSDictionary(contentsOfFile: CONFIGURATION_PATH!)

    // Clear and hide labels
    lblUUID.isHidden = true
    boxMajor.isHidden = true
    boxMinor.isHidden = true
    lblMinor.text = ""
    
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
        print(beacon)
        // Beacon that is near
        if beacon.proximity == CLProximity.near {
          // Look for match from database
          for location in floorplan.beacons! {
            // Found match
            if location.minor! == beacon.minor {
              // Only update if different
              if lblMinor.text != beacon.minor.stringValue {
                // Change labels
                lblUUID.text = floorplan.uuid!
                lblMajor.text = location.major?.stringValue
                lblMinor.text = location.minor?.stringValue
                
                // Authentication
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
          
          // Show values
          lblUUID.isHidden = false
          boxMajor.isHidden = false
          boxMinor.isHidden = false
        }
      }
    } else {
      // Hide and clean up
      lblUUID.isHidden = true
      boxMajor.isHidden = true
      boxMinor.isHidden = true
      lblMinor.text = ""      
    }
  }
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
}
