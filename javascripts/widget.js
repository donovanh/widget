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

        init: function(email, app_id, site_owner) {
            var settings = {
                user_data: {
                    email: email
                },
                app_id: app_id,
                site_owner: site_owner
            };
            $.widget.applySettings(settings);
            $.widget.attachListeners();
            $.widget.sendPing();
        },

        attachListeners: function() {
            $('.widget .close').click(function() {
              $('.widget').removeClass('show').addClass('hide');
              $('.button').removeClass('hide');
            });

            $('.button').click(function() {
              $.widget.setUpNewMessage();
            });
        },

        attachNewMessageListener: function() {
            $('.new-message form').submit(function(e) {
                e.preventDefault();
                var message = $('.new-message textarea').val();
                if (message.length > 0) {
                    $.widget.createConversation(message);
                }
            });
        },

        attachReplyListener: function() {
            $('.widget form').submit(function(e) {
                e.preventDefault();
                var message = $('.widget input[type=text]').val();
                if (message.length > 0) {
                    $.widget.replyToConversation(message);
                }
            });
        },

        logResponse: function(data) {
            console.log(JSON.stringify(data));
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
                callback: $.widget.handleUnreadConversations
            }
            $.widget.sendRequest(args);
        },

        /*
         *  handleUnreadConversations: Check server response for any unread conversations
         *  If an unread "interrupt" conversation available, show oldest
         */
        handleUnreadConversations: function(response) {
            response = {
                "app": {
                    "name": "Shop Ireland",
                    "paid": true,
                    "show_powered_by": true
                },
                "user": {
                    "id": "5307cb60fd080613d900a42a"
                },
                "unread_conversation_ids": [
                    338920091
                ],
                "unread_inbox_conversation_ids": [],
                "unread_interrupt_conversation_ids": [
                    338920091
                ],
                "modules": {
                    "messages": {
                        "colors": {
                            "base": "#333333"
                        },
                        "features": {
                            "widget_attachments": false
                        },
                        "activator": "#IntercomDefaultWidget",
                        "use_activator": true
                    },
                    "pusher": {}
                }
            };
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
                callback: $.widget.showMessage
            }
            $.widget.sendRequest(args);
        },

        /*
         *  getAllConversations: Retrieves the inbox
         */
        getAllConversations: function() {
            var args = {
                type: "POST",
                url: $.widget.urls.inbox,
                data: $.widget.settings,
                callback: $.widget.logResponse
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
            data.body = message;
            var args = {
                type: "POST",
                url: $.widget.urls.createConversation,
                data: $.widget.settings,
                callback: $.widget.showMessage
            }
            $.widget.sendRequest(args);
        },

        /*
         *  replyToConversation: Reply to an existing conversation thread
         */
        replyToConversation: function(message) {
            var data = $.widget.settings;
            data.request_type = "comment";
            data.body = "Test from JS";
            var args = {
                type: "POST",
                url: $.widget.urls.createConversation,
                data: $.widget.settings,
                callback: $.widget.showMessage
            }
            $.widget.sendRequest(args);
        },

        /*
         *  setUpNewMessage: Sets the new message template and shows widget
         */
        setUpNewMessage: function() {
            $.widget.insertTemplate('#newMessageTPL', '#widget-content', $.widget.settings);
            $.widget.showWidget();
            $.widget.attachNewMessageListener();
        },

        showMessage: function(data) {
            console.log(data);
            if (data.conversations.length > 0) {
                var templateData = $.widget.settings;
                if (data.conversations[0].messages.length == 1 && data.conversations[0].messages[0].from.is_admin !== false) {
                    // Render single message
                    templateData.message = data.conversations[0].messages[0];
                    $.widget.insertTemplate('#singleMessageTPL', '#widget-content', templateData);
                } else {
                    // Render thread view
                    templateData.messages = data.conversations[0].messages;
                    $.widget.insertTemplate('#threadTPL', '#widget-content', templateData);
                    $.widget.scrollToLastMessage();
                    $.widget.message_id = data.id;
                }
                $.widget.showWidget();
                $.widget.attachReplyListener();
            }
        },

        /*
         *  insertTemplate: helper function to insert template with values
         */
        insertTemplate: function(source, target, data, append) {
            var template = $(source).html();
            var html = Mustache.to_html(template, data);
            if (append) {
                $(target).append(html);
            } else {
                $(target).html(html);
            }
        },

        /*
         *  showWidget: Shows the widget and hides the button
         */
        showWidget: function() {
            $('.widget').addClass('show').removeClass('hide');
            $('.button').addClass('hide');
        },

        scrollToLastMessage: function() {
            $('.widget .content.thread').scrollTop($('.widget .content.thread')[0].scrollHeight);
        },

        /*
         *  sendRequst: wrapper for jQuery's AJAX method
         */
        sendRequest: function(args) {
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
