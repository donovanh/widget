/*
 * A jQuery plugin to replicate some of the basic functionality of Intercom's widget
 * Usage:
 * $.widget("impression", {"email": "donovanh@gmail.com"});
 * $.widget("methodName"[, {}];
 *
*/
;(function($) {
    "use strict";
    $.widget = {

        urls: {
            ping:                   "https://api.intercom.io/vjs/users/ping",
            showConversation:       "https://api.intercom.io/vjs/conversations/show",
            inbox:                  "https://api.intercom.io/vjs/conversations/inbox",
            createConversation:     "https://api.intercom.io/vjs/conversations/create",
            replyToConversation:    "https://api.intercom.io/vjs/conversations/reply"
        },

        settings: {},

        init: function(email, app_id) {
            var settings = {
                user_data: {
                    email: email
                },
                app_id: app_id
            };
            $.widget.applySettings(settings);
            $.widget.sendPing();
        },

        applySettings: function(settings) {
            $.widget.settings = settings;
        },

        /*
         *  sendPing: ping to check for available conversations
         */
        sendPing: function() {
            var args = {
                type: "POST",
                url: $.widget.urls.ping,
                data: $.widget.settings,
                callback: function(data) { $.widget.handleUnreadConversations(data); }
            }
            $.widget.sendRequest(args);
        },

        /*
         *  handleUnreadConversations: Check server response for any unread conversations
         *  If an unread "interrupt" conversation available, show oldest
         */
        handleUnreadConversations: function(response) {
            if (response.unread_interrupt_conversation_ids.length > 0) {
                var earliest_conversation = response.unread_interrupt_conversation_ids[response.unread_interrupt_conversation_ids.length-1];
                $.widget.getConversation(earliest_conversation);
            }
        },

        /*
         *  getConversation: Get a conversation for a specific id
         */
        getConversation: function(conversation_id) {
            var data = $.widget.settings;
            data.id = conversation_id;
            var args = {
                type: "POST",
                url: $.widget.urls.showConversation,
                data: data,
                callback: function(data) { console.log(JSON.stringify(data)); }
            }
            $.widget.sendRequest(args);
            // TODO: Render conversation
        },

        /*
         *  getAllConversations: Retrieves the inbox
         */
        getAllConversations: function() {
            var args = {
                type: "POST",
                url: $.widget.urls.inbox,
                data: $.widget.settings,
                callback: function(data) { console.log(JSON.stringify(data)); }
            }
            $.widget.sendRequest(args);
            // TODO: Render conversation list to inbox
        },

        /*
         *  createConversation: Creates a new message through the API
         */
        createConversation: function(message) {
            var data = $.widget.settings;
            data.request_type = "message";
            // TODO: get message from page
            data.body = "Test from JS";
            var args = {
                type: "POST",
                url: $.widget.urls.createConversation,
                data: $.widget.settings,
                callback: function(data) { console.log(JSON.stringify(data)); }
            }
            // TODO: Inset new message into DOM
            // Do so optimistically?
            $.widget.sendRequest(args);
        },

        /*
         *  replyToConversation: Reply to an existing conversation thread
         */
        replyToConversation: function(message) {
            var data = $.widget.settings;
            data.request_type = "comment";
            data.message_id = 338574254;
            // TODO: get message from page
            data.body = "Test from JS";
            var args = {
                type: "POST",
                url: $.widget.urls.createConversation,
                data: $.widget.settings,
                callback: function(data) { console.log(JSON.stringify(data)); }
            }
            // TODO: Inset new message into DOM
            // Do so optimistically?
            $.widget.sendRequest(args);
        },

        /*
         *  setUpNewMessage: Sets the new message template and shows widget
         */
        setUpNewMessage: function() {
            // TODO: Put new message template into place
            $.widget.showWidget();
        },

        /*
         *  showWidget: Shows the widget and hides the button
         */
        showWidget: function() {
            $('.widget').addClass('show').removeClass('hide');
            $('.button').addClass('hide');
        },

        /*
         *  sendRequst: wrapper for jQuery's AJAX method
         */
        sendRequest: function(args) {
            // args = {type: "", url: "", data: "", callback: ""}
            $.ajax({
                url: args.url,
                type: args.type,
                data: args.data,
                crossDomain: true,
                success: function(data) {
                    args.callback(data)
                }
            });
        }


    }

})(jQuery);
