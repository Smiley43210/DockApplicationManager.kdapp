/* Compiled by kdc on Fri Mar 28 2014 06:36:02 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/smiley43210/Applications/DockApplicationManager.kdapp/index.coffee */
var AppControllers, AppManager, DefaultApps, Dock, DockUtilController, DockUtilMainView, Notify, SetDock, _notify,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Dock = KD.getSingleton("dock");

AppManager = KD.getSingleton("appManager");

AppControllers = AppManager.appControllers;

DefaultApps = ["Activity", "Teamwork", "Terminal", "Editor", "Applications", "DevTools"];

_notify = null;

SetDock = function(Items) {
  var Application, Index, Item, _ref, _results;
  KD.resetNavItems(Items);
  Dock.setNavItems(KD.navItems);
  Dock.saveItemOrders();
  _ref = Dock.getItems();
  _results = [];
  for (Index in _ref) {
    Item = _ref[Index];
    for (Application in AppControllers) {
      if (Item["name"] === Application) {
        Item.setState("running");
        break;
      }
    }
    if (Item["name"] === AppManager.frontApp.getOption("name")) {
      _results.push(Item.highlight());
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

Notify = function(Text, Type, Class, Duration) {
  if (_notify != null) {
    _notify.destroy();
  }
  _notify = new KDNotificationView({
    title: Text,
    type: (Type != null) && Type !== false ? Type : "mini",
    duration: (Duration != null) && Duration !== false ? Duration : 1500
  });
  if ((Class != null) && Class !== false) {
    return _notify.setClass(Class);
  } else {
    if ((Type ? Type : "mini") === "mini") {
      return _notify.setClass("success");
    }
  }
};

DockUtilMainView = (function(_super) {
  __extends(DockUtilMainView, _super);

  function DockUtilMainView() {
    var _this = this;
    DockUtilMainView.__super__.constructor.apply(this, arguments);
    this.DockHeader = new KDHeaderView({
      type: "big",
      title: "Dock Management"
    });
    this.AppHeader = new KDHeaderView({
      type: "big",
      title: "Application Management"
    });
    this.Bugs = new KDOnOffSwitch({
      title: "Show the \"Bugs\" application icon:",
      defaultValue: KD.navItemIndex["Bugs"] !== void 0,
      callback: function(state) {
        var BugIcon, NavItems, i;
        if (state) {
          if (!KD.navItemIndex["Bugs"]) {
            NavItems = [];
            i = 0;
            while (i < KD.navItems.length) {
              NavItems.push(KD.navItems[i]);
              i++;
            }
            BugIcon = new Object({
              title: "Bugs",
              path: "/Bugs",
              order: i.toString(),
              type: "persistent"
            });
            NavItems.push(BugIcon);
            SetDock(NavItems);
            return Notify("Added \"Bugs\" to the dock!");
          }
        } else {
          if (KD.navItemIndex["Bugs"]) {
            KD.navItems.splice(KD.navItemIndex["Bugs"]["order"], 1);
            SetDock(KD.navItems);
            return Notify("Removed \"Bugs\" from the dock!");
          }
        }
      }
    });
    this.Reset = new KDButtonView({
      title: "Reset",
      callback: function() {
        var Activity, Apps, Bugs, DevTools, Editor, NavItems, Teamwork, Terminal;
        NavItems = Array();
        Activity = new Object({
          title: "Activity",
          path: "/Activity",
          order: "0",
          type: "persistent"
        });
        Teamwork = new Object({
          title: "Teamwork",
          path: "/Teamwork",
          order: "1",
          type: "persistent"
        });
        Terminal = new Object({
          title: "Terminal",
          path: "/Terminal",
          order: "2",
          type: "persistent"
        });
        Editor = new Object({
          title: "Editor",
          path: "/Ace",
          order: "3",
          type: "persistent"
        });
        Apps = new Object({
          title: "Apps",
          path: "/Apps",
          order: "4",
          type: "persistent"
        });
        DevTools = new Object({
          title: "DevTools",
          path: "/DevTools",
          order: "5",
          type: "persistent"
        });
        Bugs = new Object({
          title: "Bugs",
          path: "/Bugs",
          order: "6",
          type: ""
        });
        NavItems.push(Activity);
        NavItems.push(Teamwork);
        NavItems.push(Terminal);
        NavItems.push(Editor);
        NavItems.push(Apps);
        NavItems.push(DevTools);
        NavItems.push(Bugs);
        SetDock(NavItems);
        return Notify("Reset applications on dock to the default arrangement!");
      }
    });
    this.Lock = new KDOnOffSwitch({
      title: "Lock non-standard application icons to prevent removal: ",
      defaultValue: this.CheckLocked(),
      callback: function(state) {
        var NonDefault, i, j;
        if (state) {
          i = 0;
          while (i < KD.navItems.length) {
            KD.navItems[i].type = "persistent";
            i++;
          }
          SetDock(KD.navItems);
          return Notify("Locked docked applications!");
        } else {
          i = 0;
          while (i < KD.navItems.length) {
            NonDefault = true;
            j = 0;
            while (j < DefaultApps.length) {
              if (KD.navItems[i].title === DefaultApps[j]) {
                NonDefault = false;
              }
              j++;
            }
            if (NonDefault) {
              KD.navItems[i].type = "";
            }
            i++;
          }
          SetDock(KD.navItems);
          return Notify("Unlocked docked applications!");
        }
      }
    });
    this.Refresh = new KDButtonView({
      title: "Refresh Application List",
      cssClass: "kdbutton clean-gray refresh",
      callback: function() {
        _this.PopulateList();
        return Notify("Application list refreshed!");
      }
    });
    this.QuitList = new KDFormView;
  }

  DockUtilMainView.prototype.CheckLocked = function() {
    var a;
    a = 0;
    while (a < KD.navItems.length) {
      if (KD.navItems[a]["type"] !== "persistent") {
        return false;
      }
      a++;
    }
    return true;
  };

  DockUtilMainView.prototype.PopulateList = function() {
    var AppOptions, Application, Option, Views,
      _this = this;
    Views = this.QuitList.getSubViews();
    this.QuitList.destroySubViews();
    AppOptions = Array();
    this.QuitList.addSubView(new KDLabelView({
      title: "Select application: ",
      cssClass: "app-label"
    }));
    this.QuitList.addSubView(this.Select = new KDSelectBox);
    this.QuitList.addSubView(new KDLabelView({
      title: " "
    }));
    this.QuitList.addSubView(this.Quit = new KDButtonView({
      title: "Quit Application",
      callback: function() {
        AppManager.quitByName(_this.Select.getValue());
        Notify("Quit application \"" + _this.Select.getValue() + "\"!", "tray", false, 3000);
        return _this.PopulateList();
      }
    }));
    for (Application in AppControllers) {
      Option = Array();
      Option.value = Application;
      Option.title = Application;
      AppOptions.push(Option);
    }
    return this.Select.setSelectOptions(AppOptions);
  };

  DockUtilMainView.prototype.pistachio = function() {
    return "{{> this.DockHeader}}\n<br>\n{{> this.Bugs}}\n<br>\nReset icons on dock to the default arrangement:{{> this.Reset}}\n<br><br>\n{{> this.Lock}}\n<br>\n{{> this.AppHeader}}\n<br>\nQuit running applications\n<br>\n<br>\n{{> this.Refresh}}\n<br>\n<br>\n{{> this.QuitList}}\n<br>";
  };

  DockUtilMainView.prototype.viewAppended = function() {
    return this.setTemplate(this.pistachio());
  };

  return DockUtilMainView;

})(KDView);

DockUtilController = (function(_super) {
  __extends(DockUtilController, _super);

  function DockUtilController(options, data) {
    if (options == null) {
      options = {};
    }
    options.view = new DockUtilMainView({
      cssClass: "dockutil-app"
    });
    options.view.PopulateList();
    options.appInfo = {
      name: "DockApplicationManager",
      type: "application"
    };
    DockUtilController.__super__.constructor.call(this, options, data);
  }

  return DockUtilController;

})(AppController);

(function() {
  var view;
  if (typeof appView !== "undefined" && appView !== null) {
    view = new DockUtilMainView({
      cssClass: "dockutil-app"
    });
    view.PopulateList();
    return appView.addSubView(view);
  } else {
    return KD.registerAppClass(DockUtilController, {
      name: "DockApplicationManager",
      routes: {
        "/:name?/Dockapplicationmanager": null,
        "/:name?/smiley43210/Apps/Dockapplicationmanager": null
      },
      dockPath: "/smiley43210/Apps/Dockapplicationmanager",
      behavior: "application"
    });
  }
})();

/* KDAPP ENDS */
}).call();