# Pip.WebUI.Locations User's Guide

## <a name="contents"></a> Contents
- [Installing](#install)
- [pip-location directive](#location)
- [pip-location-map directive](#location_map)
- [pip-location-ip directive](#location_ip)
- [pip-location-edit directive](#location_edit)
- [pipLocationDialog](#location_dialog)
- [Questions and bugs](#issues)


## <a name="install"></a> Installing

Add dependency to **pip-webui** into your **bower.json** or **package.json** file depending what you use.
```javascript
"dependencies": {
  ...
  "pip-webui": "*"
  ...
}
```

Alternatively you can install **pip-webui** manually using **bower**:
```bash
bower install pip-webui
```

or install it using **npm**:
```bash
npm install pip-webui
```

Include **pip-webui** files into your web application.
```html
<link rel="stylesheet" href=".../pip-webui-lib.min.css"/>
<link rel="stylesheet" href=".../pip-webui.min.css"/>
...
<script src=".../pip-webui-lib.min.js"></script>
<script src=".../pip-webui.min.js"></script>
```

Register **pipLocations** module in angular module dependencies.
```javascript
angular.module('myApp',[..., 'pipLocations']);
```


## <a name="location_map"></a> pip-location-map directive

**pip-location-map** is the most basic among all controls. It visualized a point on a small map that can be embedded into a view.

### Usage
Todo: Add HTML snippet to demonstrate the directive with all attributes

<img src="images/img-location-map.png"/>

### Attributes
Todo: Describe directive attributes here


## <a name="location"></a> pip-location directive

**pip-location** shows address or coordinates if address is not available followed by the map with the point.
The control can be set to make map collapsable to save some space on screen.

### Usage
Todo: Add HTML snippet to demonstrate the directive with all attributes

Todo: replace picture with correct screenshot
<img src="images/img-location-edit-view.png"/>
    
### Attributes
Todo: Describe directive attributes here


## <a name="location_ip"></a> pip-location-ip directive

**pip-location-ip** control may look exactly as **pip-location-view**. But instead of position it accepts IP address and uses Google location service to convert it into physical address. This control can be helpful to visualize location of servers or places there users signin into application.

### Usage
Todo: Add HTML snippet to demonstrate the directive with all attributes

<img src="images/img-location-ip.png"/>

### Attributes
Todo: Describe directive attributes here


## <a name="location_edit"></a> pip-location-edit directive

**pip-location-edit** allows to change the location address or coordinates. They can be entered manually or set via **pipLocationDialog**

### Usage
Todo: Add HTML snippet to demonstrate the directive with all attributes

<img src="images/img-location-edit-view.png"/>

### Attributes
Todo: Describe directive attributes here


## <a name="location_dialog"></a> pipLocationDialog

**pipLocationDialog** allows to set location by manually picking a point on map, or using current location from the device.

### Usage
Todo: Add code snippet to show how to open dialog

<img src="images/img-location-dialog.png"/>

### Methods
Todo: Describe dialog methods here


## <a name="issues"></a> Questions and bugs

If you have any questions regarding the module, you can ask them using our 
[discussion forum](https://groups.google.com/forum/#!forum/pip-webui).

Bugs related to this module can be reported using [github issues](https://github.com/pip-webui/pip-webui-locations/issues).
