import Foundation
import Capacitor
import Kommunicate
import Applozic

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(KommunicateCapacitorPlugin)
public class KommunicateCapacitorPlugin: CAPPlugin, KMPreChatFormViewControllerDelegate {
    var appId : String? = nil;
    var agentIds: [String]? = [];
    var botIds: [String]? = [];
    var createOnly: Bool = false
    var isSingleConversation: Bool = true;
    var callback: CAPPluginCall?
    var conversationAssignee: String? = nil;
    var clientConversationId: String? = nil;
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": value
        ])
    }
    
    @objc func buildConversation(_ call: CAPPluginCall) {
        self.callback = call
        var withPrechat : Bool = false
        var kmUser : KMUser? = nil
        
        if call.hasOption("appId") {
            appId = call.getString("appId")
        }
        
        if call.hasOption("withPreChat") {
            withPrechat = call.getBool("withPreChat") ?? false
        }
        
        if call.hasOption("isSingleConversation") {
            self.isSingleConversation = call.getBool("isSingleConversation") ?? true
        }
        
        if call.hasOption("createOnly") {
            self.createOnly = call.getBool("createOnly") ?? false
        }
        
        if(call.hasOption("conversationAssignee")) {
            self.conversationAssignee = call.getString("conversationAssignee")
        }
        
        if(call.hasOption("clientConversationId")) {
            self.clientConversationId = call.getString("clientConversationId")
        }
        
        let agentIds = jsonObj["agentIds"] as? [String]
        let botIds = jsonObj["botIds"] as? [String]
        
        self.agentIds = agentIds
        self.botIds = botIds
        
        if Kommunicate.isLoggedIn{
            self.handleCreateConversation()
        }else{
            if jsonObj["appId"] != nil {
                Kommunicate.setup(applicationId: jsonObj["appId"] as! String)
            }
            
            if !withPrechat {
                if jsonObj["kmUser"] != nil {
                    var jsonSt = jsonObj["kmUser"] as! String
                    jsonSt = jsonSt.replacingOccurrences(of: "\\\"", with: "\"")
                    jsonSt = "\(jsonSt)"
                    kmUser = KMUser(jsonString: jsonSt)
                    kmUser?.applicationId = appId
                } else {
                    kmUser = KMUser.init()
                    kmUser?.userId = Kommunicate.randomId()
                    kmUser?.applicationId = appId
                }
                
                Kommunicate.registerUser(kmUser!, completion:{
                    response, error in
                    guard error == nil else{
                        call.error(error!.localizedDescription)
                        return
                    }
                    self.handleCreateConversation()
                })
            } else {
                DispatchQueue.main.async {
                    let controller = KMPreChatFormViewController(configuration: Kommunicate.defaultConfiguration)
                    controller.delegate = self
                    UIApplication.topViewController()?.present(controller, animated: false, completion: nil)
                }
            }
        }
        
    }
    
    @objc func updateChatContext(_ call: CAPPluginCall) {
        guard let chatContext = call.arguments as? Dictionary<String, Any> else {
            return
        }
        do {
            if(Kommunicate.isLoggedIn) {
                try Kommunicate.defaultConfiguration.updateChatContext(with: chatContext)
                call.success([
                    "success": "Chat context updated"
                ])
            } else {
                call.error("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext")
            }
        } catch  {
            print(error)
            call.error(error.localizedDescription)
        }
    }
    
    @objc func updateUserDetails(_ call: CAPPluginCall) {
        guard let kmUser = call.arguments as? Dictionary<String, Any> else {
            call.error("Invalid kmUser object")
            return
        }
        if(Kommunicate.isLoggedIn) {
            self.updateUser(displayName: kmUser["displayName"] as? String, imageLink: kmUser["imageLink"] as? String, status: kmUser["status"] as? String, metadata: kmUser["metadata"] as? NSMutableDictionary, phoneNumber: kmUser["contactNumber"] as? String, email: kmUser["email"] as? String, result: call)
        } else {
            call.error("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the user details")
        }
    }
    
    @objc func logout(_ call: CAPPluginCall) {
        Kommunicate.logoutUser { (logoutResult) in
            switch logoutResult {
            case .success(_):
                call.success([
                    "success":  "Logout successful"
                ])
            case .failure( _):
                call.error("Error in logout")
            }
        }
    }
    
    func handleCreateConversation(){
        let builder = KMConversationBuilder();
        
        if let agentIds = self.agentIds, !agentIds.isEmpty {
            builder.withAgentIds(agentIds)
        }
        
        if let botIds = self.botIds, !botIds.isEmpty {
            builder.withBotIds(botIds)
        }
        
        builder.useLastConversation(self.isSingleConversation)
        
        if let assignee = self.conversationAssignee {
            builder.withConversationAssignee(assignee)
        }
        
        if let clientConversationId = self.clientConversationId {
            builder.withClientConversationId(clientConversationId)
        }
        
        Kommunicate.createConversation(conversation: builder.build(),
                                       completion: { response in
                                        switch response {
                                        case .success(let conversationId):
                                            if self.createOnly {
                                                self.callback?.success([
                                                    "conversationId": conversationId
                                                ])
                                            } else {
                                                self.openParticularConversation(conversationId, true, self.callback!)
                                            }
                                            self.callback?.success([
                                                "conversationId": conversationId
                                            ])
                                            
                                        case .failure(let error):
                                            self.callback?.error(error.localizedDescription)
                                        }
                                       })
    }
    
    func openParticularConversation(_ conversationId: String,_ skipConversationList: Bool, _ callback: CAPPluginCall) -> Void {
        DispatchQueue.main.async{
            if let top = UIApplication.topViewController() {
                Kommunicate.showConversationWith(groupId: conversationId, from: top, completionHandler: ({ (shown) in
                    if(shown) {
                        callback.success([
                            "conversationId": conversationId
                        ])
                    } else {
                        callback.error("Failed to launch conversation with conversationId : " + conversationId)
                    }
                }))
            } else {
                callback.error("Failed to launch conversation with conversationId : " + conversationId)
            }}
    }
    
    public func userSubmittedResponse(name: String, email: String, phoneNumber: String) {
        UIApplication.topViewController()?.dismiss(animated: false, completion: nil)
        
        let kmUser = KMUser.init()
        guard let applicationKey = appId else {
            return
        }
        
        kmUser.applicationId = applicationKey
        
        if(!email.isEmpty){
            kmUser.userId = email
            kmUser.email = email
        }else if(!phoneNumber.isEmpty){
            kmUser.contactNumber = phoneNumber
        }
        
        kmUser.contactNumber = phoneNumber
        kmUser.displayName = name
        
        Kommunicate.registerUser(kmUser, completion:{
            response, error in
            guard error == nil else {
                self.callback?.error("Unable to login")
                return
            }
            self.handleCreateConversation()
        })
    }
    
    public func closeButtonTapped() {
        UIApplication.topViewController()?.dismiss(animated: false, completion: nil)
    }
    
    func updateUser (displayName: String?, imageLink : String?, status: String?, metadata: NSMutableDictionary?,phoneNumber: String?,email : String?, call: CAPPluginCall) {
        
        let theUrlString = "\(ALUserDefaultsHandler.getBASEURL() as String)/rest/ws/user/update"
        
        let dictionary = NSMutableDictionary()
        if (displayName != nil) {
            dictionary["displayName"] = displayName
        }
        if imageLink != nil {
            dictionary["imageLink"] = imageLink
        }
        if status != nil {
            dictionary["statusMessage"] = status
        }
        if (metadata != nil) {
            dictionary["metadata"] = metadata
        }
        if phoneNumber != nil {
            dictionary["phoneNumber"] = phoneNumber
        }
        if email != nil {
            dictionary["email"] = email
        }
        var postdata: Data? = nil
        do {
            postdata = try JSONSerialization.data(withJSONObject: dictionary, options: [])
        } catch {
            call.error(error.localizedDescription)
            return
        }
        var theParamString: String? = nil
        if let postdata = postdata {
            theParamString = String(data: postdata, encoding: .utf8)
        }
        let theRequest = ALRequestHandler.createPOSTRequest(withUrlString: theUrlString, paramString: theParamString)
        ALResponseHandler.authenticateAndProcessRequest(theRequest,andTag: "UPDATE_DISPLAY_NAME_AND_PROFILE_IMAGE", withCompletionHandler: {
            theJson, theError in
            guard theError == nil else {
                call.error(theError!.localizedDescription)
                return
            }
            guard let apiResponse = ALAPIResponse(jsonString: theJson as? String),apiResponse.status != "error"  else {
                let reponseError = NSError(domain: "Kommunicate", code: 1, userInfo: [NSLocalizedDescriptionKey : "ERROR IN JSON STATUS WHILE UPDATING USER STATUS"])
                call.error(reponseError.localizedDescription)
                return
            }
            call.success([
                "success": "User details updated"
            ])
        })
    }
}

extension UIApplication {
    class func topViewController(controller: UIViewController? = UIApplication.shared.keyWindow?.rootViewController) -> UIViewController? {
        if let navigationController = controller as? UINavigationController {
            return topViewController(controller: navigationController.visibleViewController)
        }
        if let tabController = controller as? UITabBarController {
            if let selected = tabController.selectedViewController {
                return topViewController(controller: selected)
            }
        }
        if let presented = controller?.presentedViewController {
            return topViewController(controller: presented)
        }
        return controller
    }}
