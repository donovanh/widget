describe("Widget", function() {

  beforeEach(function() {
    // details = {email: "..."}
    userObject = {
        user_data: { email: "test@example.com" },
        app_id: "f56d66fb3fa5538bd93854e7f04219b2c761bc69"
    }
    $.widget.applySettings(userObject);

  });

  it("should ping the server", function() {
    // Given the userObject, this will pass if it passes the correct request to sendRequest
    spyOn($.widget, 'sendRequest');
    $.widget.sendPing(userObject);
    var expectedparams = {
      type: 'POST',
      url: 'https://api.intercom.io/vjs/users/ping',
      data: {
        user_data : {
          email : 'test@example.com'
        },
        app_id : 'f56d66fb3fa5538bd93854e7f04219b2c761bc69'
      },
      callback : $.widget.handleUnreadConversations
    }
    expect($.widget.sendRequest).toHaveBeenCalledWith(expectedparams);
  });

  // handleUnreadConversations
  it("should get the latest conversation, if there is one", function() {
    spyOn($.widget, 'getConversation');
    var response = {"unread_interrupt_conversation_ids": [338574254]};
    $.widget.handleUnreadConversations(response);
    expect($.widget.getConversation).toHaveBeenCalledWith(338574254);
  });
  it("should not get the latest conversation, if there isn't one", function() {
    spyOn($.widget, 'getConversation');
    var response = {"unread_interrupt_conversation_ids": []};
    $.widget.handleUnreadConversations(response);
    expect($.widget.getConversation).not.toHaveBeenCalled();
  });

  // getConversation
  it("should get a conversation by ID", function() {
    spyOn($.widget, 'sendRequest');
    $.widget.getConversation(338574254);
    var expectedparams = {
        type: 'POST',
        url: 'https: //api.intercom.io/vjs/conversations/show',
        data: {
            user_data: {
                email: 'test@example.com'
            },
            app_id: 'f56d66fb3fa5538bd93854e7f04219b2c761bc69',
            id: 338574254
        },
        callback: $.widget.showMessage
    };
    expect($.widget.sendRequest).toHaveBeenCalledWith(expectedparams);
  });

  // getAllConversations
  it("should get Inbox contents", function() {
    spyOn($.widget, 'sendRequest');
    $.widget.getAllConversations();
    expect($.widget.sendRequest).toHaveBeenCalled();
  });

  // createConversation
  it("should create a new conversation", function() {
    spyOn($.widget, 'sendRequest');
    $.widget.createConversation("jasmine test");
    expect($.widget.sendRequest).toHaveBeenCalled();
  });

  // replyToConversation
  it("should reply to an existing conversation", function() {
    spyOn($.widget, 'sendRequest');
    $.widget.replyToConversation("jasmine test");
    expect($.widget.sendRequest).toHaveBeenCalled();
  });

});