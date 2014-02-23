# jQuery Widget

This is set up for demonstration purposes only, not to be used in any production environment.

## Set up

The plugin requires:

* jQuery
* Mustache.js

To use, make sure jQuery and Mustache are in place, and the [widget.js](https://github.com/donovanh/widget/blob/master/javascripts/widget.js) file is also referenced, then initialise the plugin like so:

    <script>
      $(document).ready(function() {
        var email = "user@example.com";
        var app_id = "YOUR_APP_ID";
        var site_owner = "Your App Name";
        $.widget.init(email, app_id, site_owner);
      });
    </script>

## Methods

A list of the methods within the plugin:

### Visual

* scrollToLastMessage
* showWidget

### Main methods

* init
* sendPing
* handleUnreadConversations
* getConversation
* getAllConversations       # Inbox: not implemented in this version
* createConversation
* replyToConversation
* showMessage

### Helpers

* embedWidget
* attachListeners
* attachNewMessageListener
* attachReplyListener
* applySettings
* setUpNewMessage
* insertTemplate
* sendRequest    # Wrapper for jQuery's AJAX method * separate so that it can be Spied in Jasmine

## Technology used

* jQuery
* Mustache templates
* SASS + Autoprefixer + Grunt.js for build
* Project skeleton files: https://github.com/donovanh/sass-grunt-jasmine-skeleton
