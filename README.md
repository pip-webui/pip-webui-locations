# <img src="https://github.com/pip-webui/pip-webui/blob/master/doc/Logo.png" alt="Pip.WebUI Logo" style="max-width:30%"> <br/> Location controls

![](https://img.shields.io/badge/license-MIT-blue.svg)

GPS and location technologies made position determination available for everyone everywhere. 
Position information today is used in Line-of-Business applications today very frequently.
Pip.WebUI.Locations module provides controls to visualize and edit positions. 
They are built on the of Google Maps and require registered key to be set by developers.

**Location map** is the most basic among all controls. It visualized a point on a small map that can be embedded into a view.

<a href="doc/images/img-location-map.png" style="border: 3px ridge #c8d2df; margin: auto; display: inline-block">
    <img src="doc/images/img-location-map.png"/>
</a>

**Location view** shows address or coordinates if address is not available followed by the map with the point.
The control can be set to make map collapsable to save some space on screen.

Todo: replace picture with correct screenshot
<a href="doc/images/img-location-edit-view.png" style="border: 3px ridge #c8d2df; margin: auto; display: inline-block">
    <img src="doc/images/img-location-edit-view.png"/>
</a>

**Location IP** control may look exactly as **Location view**. But instead of position it accepts IP address and uses Google location service to convert it into physical address. This control can be helpful to visualize location of servers or places there users signin into application.

<a href="doc/images/img-location-ip.png" style="border: 3px ridge #c8d2df; margin: auto; display: inline-block">
    <img src="doc/images/img-location-ip.png"/>
</a>

**Location edit** allows to change the location address or coordinates. They can be entered manually or set via **Location dialog**

<a href="doc/images/img-location-edit-view.png" style="border: 3px ridge #c8d2df; margin: auto; display: inline-block">
    <img src="doc/images/img-location-edit-view.png"/>
</a>

**Location dialog** allows to set location by manually picking a point on map, or using current location from the device.

<a href="doc/images/img-location-dialog.png" style="border: 3px ridge #c8d2df; width: 50%; margin: auto; display: block">
    <img src="doc/images/img-location-dialog.png"/>
</a>


## Learn more about the module

- [User's guide](doc/UsersGuide.md)
- [Online samples](http://webui.pipdevs.com/pip-webui-locations/index.html)
- [API reference](http://webui-api.pipdevs.com/pip-webui-locations/index.html)
- [Developer's guide](doc/DevelopersGuide.md)
- [Changelog](CHANGELOG.md)
- [Pip.WebUI project website](http://www.pipwebui.org)
- [Pip.WebUI project wiki](https://github.com/pip-webui/pip-webui/wiki)
- [Pip.WebUI discussion forum](https://groups.google.com/forum/#!forum/pip-webui)
- [Pip.WebUI team blog](https://pip-webui.blogspot.com/)

## <a name="dependencies"></a>Module dependencies

* [pip-webui-lib](https://github.com/pip-webui/pip-webui-lib): angular, angular material and other 3rd party libraries
* [pip-webui-css](https://github.com/pip-webui/pip-webui-css): CSS styles and web components
* [pip-webui-core](https://github.com/pip-webui/pip-webui-core): localization and other core services

## <a name="license"></a>License

This module is released under [MIT license](License) and totally free for commercial and non-commercial use.
