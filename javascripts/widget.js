/*
 * A jQuery plugin to replicate some of the basic functionality of Intercom's widget
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

        /*
         *  init: Creates a settings object for future use, inserts the widget and starts a ping
         */
        init: function(email, app_id, site_owner) {
            var settings = {
                user_data: {
                    email: email
                },
                app_id: app_id,
                site_owner: site_owner
            };
            $.widget.applySettings(settings);
            $.widget.embedWidget();
            $.widget.sendPing();
        },

        /*
         *  embedWidget: Embed the widget HTML into the DOM, and attach click events to it
         */
        embedWidget: function() {
            $('body').append('<div id="widget-embed"></div>');
            $.widget.insertTemplate('#widgetTPL', '#widget-embed', '');
            $.widget.attachListeners();
        },

        /*
         *  attachListeners: Attach click events to the embedded widget
         */
        attachListeners: function() {
            $('.widget .close').click(function() {
              $('.widget').removeClass('show').addClass('hide');
              $('.button').removeClass('hide');
            });

            $('.button').click(function() {
              $.widget.setUpNewMessage();
            });
        },

        /*
         *  attachNewMessageListener: Attaches submit event for new message form
         */
        attachNewMessageListener: function() {
            $('.new-message form').submit(function(e) {
                e.preventDefault();
                var message = $('.new-message textarea').val();
                if (message.length > 0) {
                    $.widget.createConversation(message);
                }
            });
        },

        /*
         *  attachReplyListener: Attaches submit event for reply form
         */
        attachReplyListener: function() {
            $('.widget form').submit(function(e) {
                e.preventDefault();
                var message = $('.widget input[type=text]').val();
                if (message.length > 0) {
                    $.widget.replyToConversation(message);
                }
            });
        },

        /*
         *  applySettings: Place user settings into object for later use
         */
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
            data.conversation_id = conversation_id;
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
        },

        /*
         *  createConversation: Creates a new message through the API
         */
        createConversation: function(message) {
            var data = $.widget.settings;
            data.request_type = "message";
            data.message_id = null;
            data.body = message;
            var args = {
                type: "POST",
                url: $.widget.urls.createConversation,
                data: data,
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
            data.body = message;
            var args = {
                type: "POST",
                url: $.widget.urls.replyToConversation,
                data: data,
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
                    $.widget.settings.message_id = data.conversations[0].id;
                }
                $.widget.showWidget();
                $.widget.scrollToLastMessage();
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
            if ($('.widget .content.thread').length > 0) {
                $('.widget .content.thread').scrollTop($('.widget .content.thread')[0].scrollHeight);
            }
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
                    console.log(data);
                    args.callback(data)
                }
            });
        }


    }

})(jQuery);
