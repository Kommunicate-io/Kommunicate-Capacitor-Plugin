(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "../dist/esm/index.js":
/*!****************************!*\
  !*** ../dist/esm/index.js ***!
  \****************************/
/*! exports provided: KommunicateCapacitorPluginWeb, KommunicatePlugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _web__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./web */ "../dist/esm/web.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KommunicateCapacitorPluginWeb", function() { return _web__WEBPACK_IMPORTED_MODULE_0__["KommunicateCapacitorPluginWeb"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KommunicatePlugin", function() { return _web__WEBPACK_IMPORTED_MODULE_0__["KommunicatePlugin"]; });


//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../dist/esm/web.js":
/*!**************************!*\
  !*** ../dist/esm/web.js ***!
  \**************************/
/*! exports provided: KommunicateCapacitorPluginWeb, KommunicatePlugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KommunicateCapacitorPluginWeb", function() { return KommunicateCapacitorPluginWeb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KommunicatePlugin", function() { return KommunicatePlugin; });
/* harmony import */ var _capacitor_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @capacitor/core */ "../node_modules/@capacitor/core/dist/esm/index.js");

class KommunicateCapacitorPluginWeb extends _capacitor_core__WEBPACK_IMPORTED_MODULE_0__["WebPlugin"] {
    constructor() {
        super({
            name: 'KommunicateCapacitorPlugin',
            platforms: ['web'],
        });
    }
    buildConversation(options) {
        return new Promise((resolve, reject) => {
            let kmUser;
            if (this.isUserLoggedIn()) {
                this.init((response) => {
                    console.log(response);
                    this.createConversation(options, JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS).userId, resolve, reject);
                }, (error) => {
                    reject(error);
                });
            }
            else {
                if (options.kmUser) {
                    kmUser = JSON.parse(options.kmUser);
                    kmUser.applicationId = options.appId;
                }
                else if (options.withPreChat && options.withPreChat == true) {
                    kmUser.withPreChat = true;
                    kmUser.applicationId = options.appId;
                }
                else {
                    kmUser = {
                        'userId': this.getRandomId(),
                        'applicationId': options.appId
                    };
                }
                this.initPlugin(kmUser, (response) => {
                    console.log(response);
                    if (!(kmUser.withPreChat && kmUser.withPreChat == true)) {
                        this.createConversation(options, kmUser.userId, resolve, reject);
                    }
                }, (error) => {
                    reject(error);
                });
            }
        });
    }
    updateChatContext(options) {
        return new Promise((resolve, reject) => {
            if (!this.isUserLoggedIn()) {
                reject("User not logged in. Call buildConversation function once before updating the chat context");
            }
            this.init((response) => {
                console.log(response);
                window.Kommunicate.updateChatContext(options);
                resolve("Chat context updated");
            }, (error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    updateUserDetails(options) {
        return new Promise((resolve, reject) => {
            if (!this.isUserLoggedIn()) {
                reject("User not logged in. Call buildConversation function once before updating the details");
            }
            this.init((response) => {
                console.log(response);
                var userDetails = {};
                if (options.email) {
                    userDetails.email = options.email;
                }
                if (options.displayName) {
                    userDetails.displayName = options.displayName;
                }
                if (options.imageLink) {
                    userDetails.imageLink = options.imageLink;
                }
                if (options.contactNumber) {
                    userDetails.contactNumber = options.contactNumber;
                }
                if (options.metadata) {
                    userDetails.metadata = options.metadata;
                }
                window.Kommunicate.updateUser(userDetails);
                resolve("user details updated");
            }, (error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    logout() {
        return new Promise((resolve, reject) => {
            if (this.isUserLoggedIn() && typeof window.Kommunicate != 'undefined' && window.Kommunicate) {
                this.init((response) => {
                    console.log(response);
                    window.Kommunicate.logout();
                    localStorage.removeItem('KM_PLUGIN_USER_DETAILS');
                    resolve("success");
                }, (error) => {
                    console.log(error);
                    reject(error);
                });
            }
            else {
                localStorage.removeItem('KM_PLUGIN_USER_DETAILS');
                resolve("success");
            }
        });
    }
    init(successCallback, errorCallback) {
        if (!this.isUserLoggedIn()) {
            errorCallback("User not logged in, call login first");
            return;
        }
        if (typeof window.Kommunicate != 'undefined' && window.Kommunicate) {
            successCallback("success");
        }
        else {
            this.initPlugin(null, successCallback, errorCallback);
        }
    }
    initPlugin(kmUser, successCallback, errorCallback) {
        if (localStorage && localStorage.KM_PLUGIN_USER_DETAILS) {
            kmUser = JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS);
        }
        ((document, m) => {
            var kommunicateSettings = {
                "appId": kmUser.applicationId,
                "popupWidget": false,
                "automaticChatOpenOnNavigation": false,
                "userId": kmUser.userId,
                "password": kmUser.password,
                "userName": kmUser.displayName,
                "email": kmUser.email,
                "imageLink": kmUser.imageLink,
                "preLeadCollection": kmUser.withPreChat ? this.getPrechatLeadDetails() : [],
                "authenticationTypeId": kmUser.authenticationTypeId,
                "onInit": function (response) {
                    if (response && response === "success") {
                        if (kmUser.withPreChat == true) {
                            let appHeaders = sessionStorage.getItem("mckAppHeaders");
                            if (appHeaders != null) {
                                kmUser.userId = JSON.parse(appHeaders).userId;
                            }
                        }
                        let chatWidgetCloseButton = document.getElementById('km-chat-widget-close-button');
                        if (chatWidgetCloseButton != null) {
                            chatWidgetCloseButton.addEventListener('click', function () {
                                var testClick = parent.document.getElementById("kommunicate-widget-iframe");
                                if (testClick != null) {
                                    testClick.style.display = "none";
                                }
                            });
                        }
                        localStorage.setItem('KM_PLUGIN_USER_DETAILS', JSON.stringify(kmUser));
                        !(kmUser.withPreChat && kmUser.withPreChat == true) && parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:none");
                        successCallback(response);
                    }
                    else {
                        errorCallback(response);
                    }
                }
            };
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.async = true;
            s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
            var h = document.getElementsByTagName("head")[0];
            h.appendChild(s);
            window.kommunicate = m;
            m._globals = kommunicateSettings;
        })(document, window.kommunicate || {});
    }
    isUserLoggedIn() {
        return localStorage && localStorage.KM_PLUGIN_USER_DETAILS;
    }
    getRandomId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 32; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    getPrechatLeadDetails() {
        return [{
                "field": "Name",
                "required": false,
                "placeholder": "enter your name" // add whatever text you want to show in the placeholder
            },
            {
                "field": "Email",
                "type": "email",
                "required": true,
                "placeholder": "Enter your email"
            },
            {
                "field": "Phone",
                "type": "number",
                "required": true,
                "element": "input",
                "placeholder": "Enter your phone number"
            }
        ];
    }
    createConversation(conversationObj, userId, success, error) {
        this.init((successCallback, errorCallback) => {
            let kommunicateSession = sessionStorage.getItem("kommunicate");
            if (!conversationObj.agentIds && kommunicateSession != null) {
                conversationObj.agentIds = [JSON.parse(kommunicateSession).appOptions.agentId];
            }
            var clientChannelKey = conversationObj.clientConversationId ? conversationObj.clientConversationId : (conversationObj.isUnique ? this.generateClientConversationId(conversationObj, userId) : "");
            if (clientChannelKey && clientChannelKey !== "") {
                window.KommunicateGlobal.Applozic.ALApiService.getGroupInfo({
                    data: {
                        clientGroupId: clientChannelKey
                    },
                    success: (response) => {
                        if (response) {
                            if (response.status === "error") {
                                if (response.errorResponse[0].errorCode === "AL-G-01") {
                                    this.startConversation(conversationObj, clientChannelKey, successCallback, errorCallback);
                                }
                                else {
                                    error(JSON.stringify(response));
                                    errorCallback(JSON.stringify(response));
                                }
                            }
                            else if (response.status === "success") {
                                this.processOpenConversation(conversationObj, clientChannelKey, successCallback);
                            }
                        }
                    },
                    error: (error) => {
                        error(error);
                        errorCallback(error);
                    }
                });
            }
            else {
                this.startConversation(conversationObj, clientChannelKey, success, error);
            }
        }, (error) => {
            error(error);
        });
    }
    processOpenConversation(conversationObj, clientChannelKey, successCallback) {
        if (conversationObj.createOnly && conversationObj.createOnly == true) {
            successCallback(clientChannelKey);
        }
        else {
            window.KommunicateGlobal.document.getElementById("mck-sidebox-launcher").click();
            window.KommunicateGlobal.$applozic.fn.applozic('loadGroupTabByClientGroupId', {
                "clientGroupId": clientChannelKey
            });
            parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
            successCallback(clientChannelKey);
        }
    }
    startConversation(conversationObj, clientChannelKey, successCallback, errorCallback) {
        var conversationDetail = {
            "agentIds": conversationObj.agentIds,
            "botIds": conversationObj.botIds,
            "skipRouting": conversationObj.skipRouting,
            "assignee": conversationObj.conversationAssignee,
            "groupName": conversationObj.groupName,
            'clientGroupId': clientChannelKey
        };
        window.Kommunicate.startConversation(conversationDetail, (response) => {
            parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
            successCallback(response);
        }, (error) => {
            errorCallback(error);
        });
    }
    generateClientConversationId(conversationObj, userId) {
        var clientId = "";
        if (conversationObj.agentIds) {
            conversationObj.agentIds.sort();
            for (let i = 0; i < conversationObj.agentIds.length; i++) {
                clientId += conversationObj.agentIds[i] + "_";
            }
        }
        else {
            let kommunicateSession = sessionStorage.getItem("kommunicate");
            if (kommunicateSession != null) {
                clientId += JSON.parse(kommunicateSession).appOptions.agentId + "_";
            }
        }
        clientId += userId;
        if (conversationObj.botIds) {
            conversationObj.botIds.sort();
            for (let i = 0; i < conversationObj.botIds.length; i++) {
                clientId += "_";
                clientId += conversationObj.botIds[i];
            }
        }
        return clientId;
    }
}
const KommunicatePlugin = new KommunicateCapacitorPluginWeb();


Object(_capacitor_core__WEBPACK_IMPORTED_MODULE_0__["registerWebPlugin"])(KommunicatePlugin);
//# sourceMappingURL=web.js.map

/***/ }),

/***/ "./$$_lazy_route_resource lazy recursive":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./node_modules/@ionic/core/dist/esm lazy recursive ^\\.\\/.*\\.entry\\.js$ include: \\.entry\\.js$ exclude: \\.system\\.entry\\.js$":
/*!*****************************************************************************************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm lazy ^\.\/.*\.entry\.js$ include: \.entry\.js$ exclude: \.system\.entry\.js$ namespace object ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./ion-action-sheet.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-action-sheet.entry.js",
		"common",
		0
	],
	"./ion-alert.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-alert.entry.js",
		"common",
		1
	],
	"./ion-app_8.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-app_8.entry.js",
		"common",
		2
	],
	"./ion-avatar_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-avatar_3.entry.js",
		"common",
		3
	],
	"./ion-back-button.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-back-button.entry.js",
		"common",
		4
	],
	"./ion-backdrop.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-backdrop.entry.js",
		5
	],
	"./ion-button_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-button_2.entry.js",
		"common",
		6
	],
	"./ion-card_5.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-card_5.entry.js",
		"common",
		7
	],
	"./ion-checkbox.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-checkbox.entry.js",
		"common",
		8
	],
	"./ion-chip.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-chip.entry.js",
		"common",
		9
	],
	"./ion-col_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-col_3.entry.js",
		10
	],
	"./ion-datetime_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-datetime_3.entry.js",
		"common",
		11
	],
	"./ion-fab_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-fab_3.entry.js",
		"common",
		12
	],
	"./ion-img.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-img.entry.js",
		13
	],
	"./ion-infinite-scroll_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-infinite-scroll_2.entry.js",
		14
	],
	"./ion-input.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-input.entry.js",
		"common",
		15
	],
	"./ion-item-option_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-item-option_3.entry.js",
		"common",
		16
	],
	"./ion-item_8.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-item_8.entry.js",
		"common",
		17
	],
	"./ion-loading.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-loading.entry.js",
		"common",
		18
	],
	"./ion-menu_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-menu_3.entry.js",
		"common",
		19
	],
	"./ion-modal.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-modal.entry.js",
		"common",
		20
	],
	"./ion-nav_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-nav_2.entry.js",
		"common",
		21
	],
	"./ion-popover.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-popover.entry.js",
		"common",
		22
	],
	"./ion-progress-bar.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-progress-bar.entry.js",
		"common",
		23
	],
	"./ion-radio_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-radio_2.entry.js",
		"common",
		24
	],
	"./ion-range.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-range.entry.js",
		"common",
		25
	],
	"./ion-refresher_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-refresher_2.entry.js",
		"common",
		26
	],
	"./ion-reorder_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-reorder_2.entry.js",
		"common",
		27
	],
	"./ion-ripple-effect.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-ripple-effect.entry.js",
		28
	],
	"./ion-route_4.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-route_4.entry.js",
		"common",
		29
	],
	"./ion-searchbar.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-searchbar.entry.js",
		"common",
		30
	],
	"./ion-segment_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-segment_2.entry.js",
		"common",
		31
	],
	"./ion-select_3.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-select_3.entry.js",
		"common",
		32
	],
	"./ion-slide_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-slide_2.entry.js",
		33
	],
	"./ion-spinner.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-spinner.entry.js",
		"common",
		34
	],
	"./ion-split-pane.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-split-pane.entry.js",
		35
	],
	"./ion-tab-bar_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-tab-bar_2.entry.js",
		"common",
		36
	],
	"./ion-tab_2.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-tab_2.entry.js",
		"common",
		37
	],
	"./ion-text.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-text.entry.js",
		"common",
		38
	],
	"./ion-textarea.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-textarea.entry.js",
		"common",
		39
	],
	"./ion-toast.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-toast.entry.js",
		"common",
		40
	],
	"./ion-toggle.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-toggle.entry.js",
		"common",
		41
	],
	"./ion-virtual-scroll.entry.js": [
		"./node_modules/@ionic/core/dist/esm/ion-virtual-scroll.entry.js",
		42
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(function() {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = "./node_modules/@ionic/core/dist/esm lazy recursive ^\\.\\/.*\\.entry\\.js$ include: \\.entry\\.js$ exclude: \\.system\\.entry\\.js$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/app.component.html":
/*!**************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/app.component.html ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<ion-app>\n  <ion-router-outlet></ion-router-outlet>\n</ion-app>\n");

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");



const routes = [
    {
        path: 'home',
        loadChildren: () => __webpack_require__.e(/*! import() | home-home-module */ "home-home-module").then(__webpack_require__.bind(null, /*! ./home/home.module */ "./src/app/home/home.module.ts")).then(m => m.HomePageModule)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
        imports: [
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes, { preloadingStrategy: _angular_router__WEBPACK_IMPORTED_MODULE_2__["PreloadAllModules"] })
        ],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
    })
], AppRoutingModule);



/***/ }),

/***/ "./src/app/app.component.scss":
/*!************************************!*\
  !*** ./src/app/app.component.scss ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */");

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/__ivy_ngcc__/fesm2015/ionic-angular.js");
/* harmony import */ var _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ionic-native/splash-screen/ngx */ "./node_modules/@ionic-native/splash-screen/__ivy_ngcc__/ngx/index.js");
/* harmony import */ var _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ionic-native/status-bar/ngx */ "./node_modules/@ionic-native/status-bar/__ivy_ngcc__/ngx/index.js");
/* harmony import */ var capacitor_plugin_kommunicate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! capacitor-plugin-kommunicate */ "../dist/esm/index.js");
/* harmony import */ var _capacitor_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @capacitor/core */ "../node_modules/@capacitor/core/dist/esm/index.js");







const KommunicateWebPlugin = _capacitor_core__WEBPACK_IMPORTED_MODULE_6__["Plugins"];
let AppComponent = class AppComponent {
    constructor(platform, splashScreen, statusBar) {
        this.platform = platform;
        this.splashScreen = splashScreen;
        this.statusBar = statusBar;
        this.initializeApp();
    }
    initializeApp() {
        this.platform.ready().then(() => {
            console.log('Platform is ready');
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }
};
AppComponent.ctorParameters = () => [
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_2__["Platform"] },
    { type: _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_3__["SplashScreen"] },
    { type: _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_4__["StatusBar"] }
];
AppComponent = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-root',
        template: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"])(__webpack_require__(/*! raw-loader!./app.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/app.component.html")).default,
        styles: [Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"])(__webpack_require__(/*! ./app.component.scss */ "./src/app/app.component.scss")).default]
    })
], AppComponent);



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/__ivy_ngcc__/fesm2015/ionic-angular.js");
/* harmony import */ var _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic-native/splash-screen/ngx */ "./node_modules/@ionic-native/splash-screen/__ivy_ngcc__/ngx/index.js");
/* harmony import */ var _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic-native/status-bar/ngx */ "./node_modules/@ionic-native/status-bar/__ivy_ngcc__/ngx/index.js");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var capacitor_plugin_kommunicate__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! capacitor-plugin-kommunicate */ "../dist/esm/index.js");










let AppModule = class AppModule {
};
AppModule = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
        declarations: [_app_component__WEBPACK_IMPORTED_MODULE_7__["AppComponent"]],
        entryComponents: [],
        imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__["BrowserModule"], _ionic_angular__WEBPACK_IMPORTED_MODULE_4__["IonicModule"].forRoot(), _app_routing_module__WEBPACK_IMPORTED_MODULE_8__["AppRoutingModule"]],
        providers: [
            _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_6__["StatusBar"],
            _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_5__["SplashScreen"],
            { provide: _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouteReuseStrategy"], useClass: _ionic_angular__WEBPACK_IMPORTED_MODULE_4__["IonicRouteStrategy"] }
        ],
        bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_7__["AppComponent"]]
    })
], AppModule);



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/__ivy_ngcc__/fesm2015/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.log(err));


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/reytum/Documents/Projects/Ionic/Kommunicate/Capacitor/Plugin/Kommunicate-Capacitor-Plugin/example/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main-es2015.js.map