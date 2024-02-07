var CHANNEL_ACCESS_TOKEN =
  "You Line CHANNEL_ACCESS_TOKEN"; // Line Bot 的 Channel Access Token
var rootFolderID = "google資料夾; // 存放檔案用的 Google 資料夾 ID
var spreadSheetID = "google sheet"; // 存放文字資訊用的 Google 試算表 ID
var ignoreSourceTypes = ["join", "leave", "follow", "unfollow"];
// 接收使用者用 Line 傳送的資料
function doPost(e) {
  var userData = JSON.parse(e.postData.contents);
  var dbase = SpreadsheetApp.openById(spreadSheetID).getActiveSheet();

  for (var i = 0; i < userData.events.length; i++) {
    if (userData.events[i].type != "message") {
      return;
    }

    var nowTime = new Date();
    var prefixFileName =
      nowTime.getFullYear() +
      append1Zero(nowTime.getMonth() + 1) +
      append1Zero(nowTime.getDate()) +
      append1Zero(nowTime.getHours()) +
      append1Zero(nowTime.getMinutes()) +
      append1Zero(nowTime.getSeconds()) +
      append2Zero(nowTime.getMilliseconds()) +
      "-";
    var groupId = "";
    var groupName = "";
    var sourceType = "";
    var userId = userData.events[i].source.userId;
    var LineText = "";
    var fileLocation = "";

    if (userData.events[i].source.type == "group") {
      groupId = userData.events[i].source.groupId;
      sourceType = userData.events[i].source.type;
      var groupProfile = JSON.parse(
        getGroupProfile(CHANNEL_ACCESS_TOKEN, groupId)
      );
      groupName = groupProfile.groupName;
    }

    if (userData.events[i].source.type == "room") {
      groupId = userData.events[i].source.roomId;
      sourceType = userData.events[i].source.type;
      groupName = "此為「聊天室」，無名稱";
    }

    var userProfile = JSON.parse(
      getUserProfile(CHANNEL_ACCESS_TOKEN, sourceType, groupId, userId)
    );

    switch (userData.events[i].message.type) {
      case "text":
        LineText = userData.events[i].message.text;
        break;

      case "sticker":
        LineText = "貼圖";
        fileLocation =
          "Package ID：" +
          userData.events[i].message.packageId +
          "、Sticker ID：" +
          userData.events[i].message.stickerId;
        break;

      case "location":
        LineText =
          "經度：" +
          userData.events[i].message.longitude +
          "、緯度：" +
          userData.events[i].message.latitude;
        if (userData.events[i].message.title) {
          LineText += "，" + userData.events[i].message.title;
        }
        if (userData.events[i].message.address) {
          LineText += "，" + userData.events[i].message.address;
        }
        break;

      case "file":
        LineText = "檔案";
        var GoogleDrive = DriveApp;
        var rootFolder = GoogleDrive.getFolderById(rootFolderID);
        var destinationFolder;

        // 檢查消息來源並創建或獲取對應的文件夾
        if (groupId != "") {
          destinationFolder = getOrCreateFolder(rootFolder, groupId);
        } else {
          destinationFolder = getOrCreateFolder(rootFolder, userId);
        }

        var messageId = userData.events[i].message.id;
        var fileData = getFileData(CHANNEL_ACCESS_TOKEN, messageId);
        var fileBlob = fileData.getBlob();

        // 從 LINE 事件中提取檔案名稱
        var originalFileName = userData.events[i].message.fileName; // LINE 訊息中檔案名稱的屬性

        // 使用原始檔案名稱創建檔案
        var file = destinationFolder.createFile(fileBlob.setName(originalFileName));
        fileLocation = file.getUrl();

        break;

      case "image":
        LineText = "圖片";
        var GoogleDrive = DriveApp;
        var rootFolder = GoogleDrive.getFolderById(rootFolderID);
        var destinationFolder;

        if (groupId != "") {
          destinationFolder = getOrCreateFolder(rootFolder, groupId);
        } else {
          destinationFolder = getOrCreateFolder(rootFolder, userId);
        }

        var messageId = userData.events[i].message.id;
        var fileData = getFileData(CHANNEL_ACCESS_TOKEN, messageId);
        var fileBlob = fileData.getBlob();
        var originalFileName = messageId + ".jpg"; // 假設檔案格式為 .jpg，因為LINE不提供原始檔案名稱

        var file = destinationFolder.createFile(fileBlob.setName(originalFileName));
        fileLocation = file.getUrl();

        break;

      case "video":
        LineText = "影片";
        var GoogleDrive = DriveApp;
        var rootFolder = GoogleDrive.getFolderById(rootFolderID);
        var destinationFolder;

        if (groupId != "") {
          destinationFolder = getOrCreateFolder(rootFolder, groupId);
        } else {
          destinationFolder = getOrCreateFolder(rootFolder, userId);
        }

        var messageId = userData.events[i].message.id;
        var fileData = getFileData(CHANNEL_ACCESS_TOKEN, messageId);
        var fileBlob = fileData.getBlob();
        var originalFileName = messageId + ".mp4"; // 假設檔案格式為 .mp4，因為LINE不提供原始檔案名稱

        var file = destinationFolder.createFile(fileBlob.setName(originalFileName));
        fileLocation = file.getUrl();

        break;

      default:
        LineText = "不支援的訊息類型";
        break;
    }

    if (!ignoreSourceTypes.includes(LineText)) {
      dbase.appendRow([
        nowTime,
        groupId,
        groupName,
        userId,
        userProfile.displayName,
        LineText,
        fileLocation,
      ]);
    }
  }
}

// 圖片資料夾
function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

// 取得檔案的 Binary 資料
function getFileData(CHANNEL_ACCESS_TOKEN, fileID) {
    var url = "https://api-data.line.me/v2/bot/message/" + fileID + "/content";
    try {
        var response = UrlFetchApp.fetch(url, {
          "method": "get",
          "headers": {
            "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
          },
          "muteHttpExceptions": true
        });
        return response;
    } catch (error) {
        Logger.log("Error fetching file data: " + error);
        return null;
    }
}


function getUserProfile(CHANNEL_ACCESS_TOKEN, sourceType, groupId, userId) {
  var url = "";

  switch (sourceType) {
    case "":
      url = "https://api.line.me/v2/bot/profile/" + userId;
      break;

    case "group":
      url = "https://api.line.me/v2/bot/group/" + groupId + "/member/" + userId;
      break;

    case "room":
      url = "https://api.line.me/v2/bot/room/" + groupId + "/member/" + userId;
      break;

    default:
      throw new Error("Invalid sourceType provided.");
  }

  return UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    method: "get",
  });
}

function getGroupProfile(CHANNEL_ACCESS_TOKEN, groupId) {
  var url = "https://api.line.me/v2/bot/group/" + groupId + "/summary";

  return UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    method: "get",
  });
}

function append1Zero(obj) {
  if (obj !== undefined && obj < 10) {
    return "0" + obj.toString();
  } else {
    return obj.toString();
  }
}

function append2Zero(obj) {
  if (obj < 10) {
    return "00" + obj.toString();
  } else {
    return obj.toString();
  }
}
