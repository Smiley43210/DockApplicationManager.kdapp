#Store commonly used objects as variables
Dock = KD.getSingleton "dock"
AppManager = KD.getSingleton "appManager"
AppControllers = AppManager.appControllers
DefaultApps = ["Activity", "Teamwork", "Terminal", "Editor", "Applications", "DevTools"]
_notify = null;

#Sets the dock items and saves them
SetDock = (Items) ->
  KD.resetNavItems Items
  Dock.setNavItems KD.navItems
  Dock.saveItemOrders()
  for Index, Item of Dock.getItems()
    for Application of AppControllers
      if Item["name"] == Application
        Item.setState("running")
        break
    if Item["name"] == AppManager.frontApp.getOption("name")
      Item.highlight()    

#Removes an existing notification if it exists, then creates a new one
#By default, creates a mini success notification with a 1.5 second duration
Notify = (Text, Type, Class, Duration) ->
  _notify?.destroy()
  _notify = new KDNotificationView
    title: Text
    type: if Type? and Type != false then Type else "mini"
    duration: if Duration? and Duration != false then Duration else 1500
  if Class? and Class != false
    _notify.setClass(Class)
  else
    if (if Type then Type else "mini") == "mini"
      _notify.setClass("success")

class DockUtilMainView extends KDView
  constructor:->
    super

    @DockHeader = new KDHeaderView
      type: "big"
      title: "Dock Management"
    @AppHeader = new KDHeaderView
      type: "big"
      title: "Application Management"
    
    @Bugs = new KDOnOffSwitch
      title: "Show the \"Bugs\" application icon:"
      defaultValue: (KD.navItemIndex["Bugs"] != undefined)
      callback: (state) ->
        if state
          if not KD.navItemIndex["Bugs"]
            NavItems = []
            i = 0
            while i < KD.navItems.length
              NavItems.push KD.navItems[i]
              i++
            BugIcon = new Object
              title: "Bugs"
              path: "/Bugs"
              order: i.toString()
              type: "persistent"
            NavItems.push BugIcon
            SetDock NavItems
            Notify "Added \"Bugs\" to the dock!"
        else
          if KD.navItemIndex["Bugs"]
            KD.navItems.splice(KD.navItemIndex["Bugs"]["order"], 1)
            SetDock KD.navItems
            Notify "Removed \"Bugs\" from the dock!"
    
    @Reset = new KDButtonView
      title: "Reset"
      callback: =>
        NavItems = Array()
        Activity = new Object
          title: "Activity"
          path: "/Activity"
          order: "0"
          type: "persistent"
        Teamwork = new Object
          title: "Teamwork"
          path: "/Teamwork"
          order: "1"
          type: "persistent"
        Terminal = new Object
          title: "Terminal"
          path: "/Terminal"
          order: "2"
          type: "persistent"
        Editor = new Object
          title: "Editor"
          path: "/Ace"
          order: "3"
          type: "persistent"
        Apps = new Object
          title: "Apps"
          path: "/Apps"
          order: "4"
          type: "persistent"
        DevTools = new Object
          title: "DevTools"
          path: "/DevTools"
          order: "5"
          type: "persistent"
        Bugs = new Object
          title: "Bugs"
          path: "/Bugs"
          order: "6"
          type: ""
        NavItems.push Activity
        NavItems.push Teamwork
        NavItems.push Terminal
        NavItems.push Editor
        NavItems.push Apps
        NavItems.push DevTools
        NavItems.push Bugs
        SetDock NavItems
        
        Notify "Reset applications on dock to the default arrangement!"
    
    @Lock = new KDOnOffSwitch
      title: "Lock non-standard application icons to prevent removal: "
      defaultValue: @CheckLocked()
      callback: (state) ->
        if state
          i = 0
          while i < KD.navItems.length
            KD.navItems[i].type = "persistent"
            i++
          SetDock KD.navItems
          Notify "Locked docked applications!"
        else
          i = 0
          while i < KD.navItems.length
            NonDefault = true
            j = 0
            while j < DefaultApps.length
              if KD.navItems[i].title == DefaultApps[j]
                NonDefault = false
              j++
            if NonDefault
              KD.navItems[i].type = ""
            i++
          SetDock KD.navItems
          Notify "Unlocked docked applications!"
    
    @Refresh = new KDButtonView
      title: "Refresh Application List"
      cssClass: "kdbutton clean-gray refresh"
      callback: =>
        @PopulateList()
        Notify "Application list refreshed!"
    
    @QuitList = new KDFormView
  
  CheckLocked: ->
    a = 0
    while a < KD.navItems.length
      if KD.navItems[a]["type"] != "persistent"
        return false
      a++
    return true
  
  PopulateList: ->
    Views = @QuitList.getSubViews()
    #for Index of Views
    #  @QuitList.removeSubView Views[Index]
    @QuitList.destroySubViews()
    AppOptions = Array()
    
    @QuitList.addSubView new KDLabelView
      title: "Select application: "
      cssClass: "app-label"
    @QuitList.addSubView @Select = new KDSelectBox
    @QuitList.addSubView new KDLabelView
      title: " "
    @QuitList.addSubView @Quit = new KDButtonView
      title: "Quit Application"
      callback: =>
        AppManager.quitByName @Select.getValue()
        Notify "Quit application \"" + @Select.getValue() + "\"!", "tray", false, 3000
        @PopulateList()
    
    for Application of AppControllers
      Option = Array()
      Option.value = Application
      Option.title = Application
      AppOptions.push Option
    @Select.setSelectOptions AppOptions
    
  pistachio:->
    """
    {{> this.DockHeader}}
    <br>
    {{> this.Bugs}}
    <br>
    Reset icons on dock to the default arrangement:{{> this.Reset}}
    <br><br>
    {{> this.Lock}}
    <br>
    {{> this.AppHeader}}
    <br>
    Quit running applications
    <br>
    <br>
    {{> this.Refresh}}
    <br>
    <br>
    {{> this.QuitList}}
    <br>
    """
  viewAppended: ->
    @setTemplate do @pistachio

class DockUtilController extends AppController
  constructor: (options = {}, data) ->
    options.view = new DockUtilMainView
      cssClass: "dockutil-app"
    options.view.PopulateList()
    options.appInfo =
      name : "DockApplicationManager"
      type : "application"
    super options, data

do ->
  if appView?
    view = new DockUtilMainView
      cssClass: "dockutil-app"
    view.PopulateList()
    appView.addSubView view
  else
    KD.registerAppClass DockUtilController,
      name : "DockApplicationManager"
      routes :
        "/:name?/Dockapplicationmanager" : null
        "/:name?/smiley43210/Apps/Dockapplicationmanager" : null
      dockPath : "/smiley43210/Apps/Dockapplicationmanager"
      behavior : "application"