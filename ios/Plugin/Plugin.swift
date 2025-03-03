import Foundation
import Capacitor
import Kommunicate
import KommunicateCore_iOS_SDK
import KommunicateChatUI_iOS_SDK

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(KommunicateCapacitorPlugin)
public class KommunicateCapacitorPlugin: CAPPlugin, KMPreChatFormViewControllerDelegate {
    public func userSubmittedResponse(name: String, email: String, phoneNumber: String, password: String) {
        //
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
                Kommunicate.setup(applicationId: applicationKey)
                Kommunicate.registerUser(kmUser, completion:{
                    response, error in
                    guard error == nil else{
                        return
                    }
                    self.handleCreateConversation()
                })
    }
    
    
    
    var appId: String?
    var agentIds: [String]? = [];
    var botIds: [String]? = [];
    var createOnly: Bool = false
    var isSingleConversation: Bool = true;
    var callback: CAPPluginCall?
    var conversationAssignee: String? = nil;
    var clientConversationId: String? = nil;
    var launchAndCreateIfEmpty: Bool = false;
    var teamId: String? = nil;
    static let CLIENT_CONVERSATION_ID: String = "clientConversationId";
    static let CONVERSATION_ID: String = "conversationId";
    
    @objc func buildConversation(_ call: CAPPluginCall) {
        self.callback = call
        var withPrechat : Bool = false
        var kmUser : KMUser? = nil
        
        guard let appId = call.options["appId"] as? String else {
            call.reject("appId is required, cannot be left blank or nil")
            return
        }
        self.appId = appId
        withPrechat = call.getBool("withPreChat", false)
        self.isSingleConversation = call.options["isSingleConversation"] as? Bool ?? true
        self.createOnly = call.options["createOnly"] as? Bool ?? false
        self.conversationAssignee = call.options["conversationAssignee"] as? String ?? nil
        self.clientConversationId = call.options["clientConversationId"] as? String ?? nil
        self.agentIds = call.options["agentIds"] as? [String] ?? []
        self.botIds = call.options["botIds"] as? [String] ?? []
        self.teamId = call.options["teamId"] as? String ?? nil
        self.launchAndCreateIfEmpty = call.options["launchAndCreateIfEmpty"] as? Bool ?? false
        
        if Kommunicate.isLoggedIn {
            self.handleCreateConversation()
        } else {
            Kommunicate.setup(applicationId: appId)
            
            if !withPrechat {
                
                if var kmUserString = call.getString("kmUser") {
                    kmUserString = kmUserString.replacingOccurrences(of: "\\\"", with: "\"")
                    kmUserString = "\(kmUserString)"
                    kmUser = KMUser(jsonString: kmUserString)
                    kmUser?.applicationId = appId
                } else {
                    kmUser = KMUser.init()
                    kmUser?.userId = Kommunicate.randomId()
                    kmUser?.applicationId = appId
                }
                
                Kommunicate.registerUser(kmUser!, completion:{
                    response, error in
                    guard error == nil else{
                        call.reject(error!.localizedDescription)
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
        guard let chatContext = call.options as? Dictionary<String, Any> else {
            return
        }
        do {
            if(Kommunicate.isLoggedIn) {
                try Kommunicate.defaultConfiguration.updateChatContext(with: chatContext)
                call.resolve([
                    "success": "Chat context updated"
                ])
            } else {
                call.reject("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext")
            }
        } catch  {
            print(error)
            call.reject(error.localizedDescription)
        }
    }
    
    @objc func updateUserDetails(_ call: CAPPluginCall) {
        if (Kommunicate.isLoggedIn) {
            self.updateUser(displayName: call.options["displayName"] as? String,
                            imageLink: call.options["imageLink"] as? String,
                            status: call.options["status"] as? String,
                            metadata: call.options as? NSMutableDictionary,
                            phoneNumber: call.options["contactNumber"] as? String,
                            email: call.options["email"] as? String, call: call)
        } else {
            call.reject("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the user details")
        }
    }
    
    @objc func getUnreadCount(_ call: CAPPluginCall) {
        if (Kommunicate.isLoggedIn) {
            call.resolve(["unreadCount":  ALUserService().getTotalUnreadCount() ?? 0])
        } else {
            call.reject("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before getting the unread count")
        }
    }

    @objc func logout(_ call: CAPPluginCall) {
        Kommunicate.logoutUser { (logoutResult) in
            switch logoutResult {
            case .success(_):
                call.resolve([
                    "success":  "Logout successful"
                ])
            case .failure( _):
                call.reject("Error in logout")
            }
        }
    }

    @objc func login(_ call: CAPPluginCall) {
        guard let appId = call.options["appId"] as? String, !appId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            call.reject("AppID is missing")
            return
        }
        
        Kommunicate.setup(applicationId: appId)
        
        do {
            guard var kmString = call.options as? [String: Any] else {
                call.reject("Error during login: Invalid JSON")
                return
            }
            
            kmString.removeValue(forKey: "appId")
            let jsonData = try JSONSerialization.data(withJSONObject: kmString, options: .prettyPrinted)
            if let jsonString = String(data: jsonData, encoding: .utf8),
               let kmUser = KMUser(jsonString: jsonString) {
                kmUser.applicationId = appId
                kmUser.platform = NSNumber(value: PLATFORM_CAPACITOR.rawValue)
                
                Kommunicate.registerUser(kmUser) { response, error in
                    if let error = error {
                        call.reject("Error during login")
                        return
                    }
                    call.resolve(["Success": "Login successful"])
                }
            } else {
                call.reject("Error during login: Invalid JSON String or KMUser")
            }
        } catch {
            call.reject("Error during login")
        }
    }

    @objc func loginAsVisitor(_ call: CAPPluginCall) {
        
        guard let appId = call.options["appId"] as? String, !appId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            call.reject("AppID is missing")
                        return
                    }
                    Kommunicate.setup(applicationId: appId)
                    
                    let kmUser = KMUser()
                    kmUser.userId = Kommunicate.randomId()
                    kmUser.applicationId = appId
                    kmUser.platform =  NSNumber(value: PLATFORM_CAPACITOR.rawValue)
                    
                    Kommunicate.registerUserAsVisitor(kmUser, completion: {
                        response, error in
                        guard error == nil else {
                            call.reject("Unable to login as Visitor")
                            return
                        }
                        call.resolve(["Success" : "Logged in as visitor"])
                    })
    }
    
    @objc func openConversation(_ call: CAPPluginCall) {
        DispatchQueue.main.async{
                        if let top = UIApplication.topViewController(){
                            Kommunicate.showConversations(from: top)
                            call.resolve(["Success" : "Successfully opened conversation"])
                        } else {
                            call.reject("Failed to open conversation")
                        }
                    }
    }
    
    @objc func updateTeamId(_ call: CAPPluginCall) {
        guard let jsonObj = call.options as? Dictionary<String, Any>, let teamId = jsonObj["teamId"] as? String else {
            call.reject("Invalid or empty Team ID")
                                    return
                                }
        guard jsonObj[KommunicateCapacitorPlugin.CLIENT_CONVERSATION_ID] != nil || jsonObj[KommunicateCapacitorPlugin.CONVERSATION_ID] != nil else {
                        call.reject("Invalid or Empty conversationID")
                        
                        return
                    }
                    if(Kommunicate.isLoggedIn) {
                                var clientConversationId: String? = nil
                        if(jsonObj[KommunicateCapacitorPlugin.CLIENT_CONVERSATION_ID]) != nil {
                                   
                            clientConversationId = jsonObj[KommunicateCapacitorPlugin.CLIENT_CONVERSATION_ID] as? String
                                    }
                                    else {
                                        guard let conversationId = jsonObj[KommunicateCapacitorPlugin.CONVERSATION_ID] as? Int else {
                                            call.reject("Invalid or Empty conversationID")
                                            return
                                        }
                                        let alChannelService = ALChannelService()
                                            alChannelService.getChannelInformation(NSNumber(value: conversationId), orClientChannelKey: nil) { (channel) in
                                                if (channel != nil && channel?.clientChannelKey != nil) {
                                                    clientConversationId = channel!.clientChannelKey
                                                }
                                                else {
                                                    call.reject("Conversation not found, please enter correct Conversation ID")
                                                }
                                            }
                                    }
                                     let conversation = KMConversationBuilder().withClientConversationId(clientConversationId).build()
                                    
                                        Kommunicate.updateTeamId(conversation: conversation, teamId: teamId){ response in
                                        switch response {
                                        case .success(let conversationId):
                                            call.resolve(["Success" : "Successfully updated team"])
                                            break
                                        case .failure(let error):
                                            call.reject("Failed to update Team")
                                            break
                                        }
                                        }
                               
                                } else {
                                    call.reject("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the teamId")
                                }
    }
    
    @objc func openParticularConversation(_ call: CAPPluginCall) {
        let alChannelService = ALChannelService()
        
        if let conversationId = call.options["conversationId"] as? String, !conversationId.isEmpty {
            alChannelService.getChannelInformation(NSNumber(value: Int(conversationId)!), orClientChannelKey: nil) { (channel) in
                guard let channel = channel, let clientChannelKey = channel.clientChannelKey else{
                    call.reject("Invalid channel")
                    return
                }
                self.openParticularConversation(clientChannelKey)

            }
            
        } else if let clientConversationId = call.options["clientConversationId"] as? String, !clientConversationId.isEmpty {
            self.openParticularConversation(clientConversationId)
        }
            else {
            call.reject("Invalid or empty conversationId")
                       return
        }
        
    }
    
    @objc func updateDefaultSettings(_ call: CAPPluginCall) {
        guard let settingDict = call.options as? Dictionary<String, Any>else {
                        
            call.reject("Unable to parse JSON")
                        return
                    }
                    Kommunicate.defaultConfiguration.clearDefaultConversationSettings()
                    if(settingDict["defaultAssignee"] != nil) {
                        Kommunicate.defaultConfiguration.defaultAssignee = settingDict["defaultAssignee"] as? String
                    }
                    if(settingDict["teamId"] != nil) {
                        Kommunicate.defaultConfiguration.defaultTeamId = settingDict["teamId"] as? String
                    }
                    if let skipRouting = settingDict["skipRouting"] as? Bool {
                        Kommunicate.defaultConfiguration.defaultSkipRouting = skipRouting
                    }
                    if let agentIds = settingDict["defaultAgentIds"] as? [String], !agentIds.isEmpty {
                        Kommunicate.defaultConfiguration.defaultAgentIds = agentIds
                    }
                    if let botIds = settingDict["defaultBotIds"] as? [String], !botIds.isEmpty {
                        Kommunicate.defaultConfiguration.defaultBotIds = botIds
                    }
        call.resolve(["Success": "Default settings updated"])
    }
    
    
    func handleCreateConversation() {
        if self.launchAndCreateIfEmpty {
            self.launchAndCreateIfEmpty(completion: {
                error in
                if let error = error {
                    print("Error while create/show: ", error)
                }
            })
        } else {
            processConversationBuilder(openWithList: false)
        }
    }
    
    func openParticularConversation(_ conversationId: String) -> Void {
        DispatchQueue.main.async {
            if let top = UIApplication.topViewController() {
                Kommunicate.showConversationWith(groupId: conversationId, from: top, completionHandler: ({ (shown) in
                    if(shown) {
                        self.callback?.resolve([
                            "clientConversationId": conversationId
                        ])
                    } else {
                        self.callback?.reject("Failed to launch conversation with conversationId : " + conversationId)
                    }
                }))
            } else {
                self.callback?.reject("Failed to launch conversation with conversationId : " + conversationId)
            }}
    }
    
    func openConversationWithList(response: String, viewController: UIViewController) {
        DispatchQueue.main.async {
            let conversationVC = Kommunicate.conversationListViewController()
            let navVC = ALKBaseNavigationViewController(rootViewController: conversationVC)
            navVC.modalPresentationStyle = .fullScreen
            viewController.present(navVC, animated: false, completion: {
                // show conversation
                Kommunicate.showConversationWith(
                    groupId: response,
                    from: conversationVC,
                    completionHandler: { success in
                        guard success else {
                            // error
                            return
                        }
                        self.callback?.resolve(["clientConversationId": response])
                        print("Kommunicate: conversation was shown")
                    })
            })
        }
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
                self.callback?.reject("Unable to login")
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
            call.reject(error.localizedDescription)
            return
        }
        var theParamString: String? = nil
        if let postdata = postdata {
            theParamString = String(data: postdata, encoding: .utf8)
        }
        let theRequest = ALRequestHandler.createPOSTRequest(withUrlString: theUrlString, paramString: theParamString)
        ALResponseHandler().authenticateAndProcessRequest(theRequest,andTag: "UPDATE_DISPLAY_NAME_AND_PROFILE_IMAGE", withCompletionHandler: {
            theJson, theError in
            guard theError == nil else {
                call.reject(theError!.localizedDescription)
                return
            }
            guard let apiResponse = ALAPIResponse(jsonString: theJson as? String),apiResponse.status != "error"  else {
                let reponseError = NSError(domain: "Kommunicate", code: 1, userInfo: [NSLocalizedDescriptionKey : "ERROR IN JSON STATUS WHILE UPDATING USER STATUS"])
                call.reject(reponseError.localizedDescription)
                return
            }
            call.resolve([
                "success": "User details updated"
            ])
        })
    }
    
    func launchAndCreateIfEmpty (
        completion: @escaping (_ error: Kommunicate.KommunicateError?) -> ()) {
        
        let applozicClient = ApplozicClient(applicationKey: KMUserDefaultHandler.getApplicationKey())
        applozicClient?.getLatestMessages(false, withCompletionHandler: {
            messageList, error in
            print("Kommunicate: message list received")
            
            // If more than 1 thread is present then the list will be shown
            if let messages = messageList, messages.count > 0, error == nil {
                DispatchQueue.main.async {
                    guard let viewController = UIApplication.topViewController() else {
                        self.callback?.reject("Unable to open conversations")
                        return
                    }
                    Kommunicate.showConversations(from: viewController)
                    self.callback?.resolve(["success": "Successfully launched chat list"])
                }
            } else {
                self.processConversationBuilder(openWithList: true)
            }
        })
    }
    
    func processConversationBuilder(openWithList: Bool) {
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
        
        if let teamId = self.teamId {
            builder.withTeamId(teamId)
        }
        
        Kommunicate.createConversation(conversation: builder.build(),
                                       completion: { response in
                                        switch response {
                                        case .success(let conversationId):
                                            if self.createOnly {
                                                self.callback?.resolve(["clientConversationId": conversationId])
                                            } else {
                                                if openWithList {
                                                    self.openConversationWithList(response: conversationId, viewController: UIApplication.topViewController()!)
                                                } else {
                                                    self.openParticularConversation(conversationId)
                                                }
                                            }
                                        case .failure(let error):
                                            self.callback?.reject(error.errorDescription ?? "")
                                        }
                                       })
    }
}

extension UIApplication {
    class func topViewController(controller: UIViewController? = UIApplication.shared.connectedScenes
                                    .compactMap { ($0 as? UIWindowScene)?.windows.first { $0.isKeyWindow } }
                                    .first?.rootViewController) -> UIViewController? {
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
    }
}
