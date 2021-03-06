const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Applet = imports.ui.applet;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const ICON_SIZE = 22;

/* Set APPLET_STYLE to one of the following and restart Cinnamon to apply changes:
 * "icon-home", "icon-home-symbolic", "icon-home-both", "icon-folder-symbolic", "icon-folder-both", "text"  */
const APPLET_STYLE = "icon-folder-both";

/* Set custom APPLET_TEXT here. Set empty string ("") for default.
 * The text is only shown when APPLET_STYLE is set to "text". */
const APPLET_TEXT = "";


function MyPopupMenuItem()
{
	this._init.apply(this, arguments);
}

MyPopupMenuItem.prototype =
{
		__proto__: PopupMenu.PopupBaseMenuItem.prototype,
		_init: function(icon, text, params)
		{
			PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);
			this.icon = icon;
			this.addActor(this.icon);
			this.label = new St.Label({ text: text });
			this.addActor(this.label);
		}
};

function MyMenu(launcher, orientation) {
	this._init(launcher, orientation);
}

MyMenu.prototype = {
		__proto__: PopupMenu.PopupMenu.prototype,

		_init: function(launcher, orientation) {
			this._launcher = launcher;

			PopupMenu.PopupMenu.prototype._init.call(this, launcher.actor, 0.0, orientation, 0);
			Main.uiGroup.add_actor(this.actor);
			this.actor.hide();
		}
};

function MyApplet(orientation) {
	this._init(orientation);
}

MyApplet.prototype = {
		__proto__: Applet.TextIconApplet.prototype,

		_init: function(orientation) {
			Applet.TextIconApplet.prototype._init.call(this, orientation);

			try {
								
				switch (APPLET_STYLE) {
				case "text":
					if (APPLET_TEXT)
						this.set_applet_label(APPLET_TEXT);
					else
						this.set_applet_label(_("Places"));
					break;
				case "icon-folder-symbolic":
					this.set_applet_icon_symbolic_name("folder");
					break;
				case "icon-folder-both":
					this.set_applet_icon_symbolic_name("folder");
					if (APPLET_TEXT)
						this.set_applet_label(APPLET_TEXT);
					else
						this.set_applet_label(_("Places"));
					break;
				case "icon-home-symbolic":
					this.set_applet_icon_symbolic_name("user-home");
					break;
				case "icon-home-both":
					this.set_applet_icon_symbolic_name("user-home");
					if (APPLET_TEXT)
						this.set_applet_label(APPLET_TEXT);
					else
						this.set_applet_label(_("Places"));
					break;
				default:
					this.set_applet_icon_name("user-home");
					break;
				}

				this.menuManager = new PopupMenu.PopupMenuManager(this);
				this.menu = new MyMenu(this, orientation);
				this.menuManager.addMenu(this.menu);

				this._display();
			}
			catch (e) {
				global.logError(e);
			};
		},

		on_applet_clicked: function(event) {
			this.menu.toggle();
		},

		_display: function() {
			let placeid = 0;
			this.placeItems = [];

			this.defaultPlaces = Main.placesManager.getDefaultPlaces();
			this.bookmarks     = Main.placesManager.getBookmarks();

			// Display default places
			for ( placeid; placeid < this.defaultPlaces.length; placeid++) {
				let icon = this.defaultPlaces[placeid].iconFactory(ICON_SIZE);
				this.placeItems[placeid] = new MyPopupMenuItem(icon, _(this.defaultPlaces[placeid].name));
				this.placeItems[placeid].place = this.defaultPlaces[placeid];

				this.menu.addMenuItem(this.placeItems[placeid]);
				this.placeItems[placeid].connect('activate', function(actor, event) {
					actor.place.launch();
				});
			}

			// Display Computer / Filesystem
			let icon = new St.Icon({icon_name: "computer", icon_size: ICON_SIZE, icon_type: St.IconType.FULLCOLOR});
			this.computerItem = new MyPopupMenuItem(icon, _("Computer"));

			this.menu.addMenuItem(this.computerItem);
			this.computerItem.connect('activate', function(actor, event) {
                Main.Util.spawnCommandLine("xdg-open computer://");
			});

			let icon = new St.Icon({icon_name: "harddrive", icon_size: ICON_SIZE, icon_type: St.IconType.FULLCOLOR});
			this.filesystemItem = new MyPopupMenuItem(icon, _("File System"));

			this.menu.addMenuItem(this.filesystemItem);
			this.filesystemItem.connect('activate', function(actor, event) {
                Main.Util.spawnCommandLine("xdg-open /");
			});

			// Separator
			this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

			let bookmarkid = 0;
			// Display default bookmarks
			for ( bookmarkid; bookmarkid < this.bookmarks.length; bookmarkid++, placeid++) {
				let icon = this.bookmarks[bookmarkid].iconFactory(ICON_SIZE);
				this.placeItems[placeid] = new MyPopupMenuItem(icon, _(this.bookmarks[bookmarkid].name));
				this.placeItems[placeid].place = this.bookmarks[bookmarkid];

				this.menu.addMenuItem(this.placeItems[placeid]);
				this.placeItems[placeid].connect('activate', function(actor, event) {
					actor.place.launch();
				});
			};
		}
};

function main(metadata, orientation) {
	let myApplet = new MyApplet(orientation);
	return myApplet;
};
