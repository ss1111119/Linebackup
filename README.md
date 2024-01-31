# Linebackup
主要參考Boris設計與功能，修正目前無法執行項目，並增加一些實際需求功能。
在業務上可能需要聊天室上的所有資料，但使用Line尋找會比較慢，所以透過google sheet的功能，有分類、篩選，可以增加保存檔案及歷史的便利性。

## 優點
1.使用Apps Script串接Line Bot可以免除很多需要架站之需求。

2.目前使用下來尚未出現問題。

##  功能
1.可以記錄line文字(有時間戳記及聊天室)。

2.可以記錄影片。

3.可以記錄圖片。

4.保留可以記錄檔案及定位資料。

5.資料名稱請參考「檔案命名方式」。

## 檔案命名方式
1.檔案可以依照上傳至line上的名稱取得檔案名。

2.根據Line Api規則，影片、圖片為媒體，所以無法取得上傳名稱，故只能依照Line給予名稱，或是自己再寫一個命名規則。

## 注意
1.要關閉Webhook redelivery，免得Line與google會出現問題。

2.要允許Allow bot to join group chats，免得加入後又離開。

## Debug
1.請善用GCP的紀錄功能，可以查出大部分問題所在。

2.Apps Script中的「執行紀錄」無法看到詳細內容。


## 紀錄表格如下
![image](https://github.com/ss1111119/Linebackup/assets/5415354/bc1c473e-1327-48ad-9790-3ea3bd05916d)

檔案存放方式如下
![image](https://github.com/ss1111119/Linebackup/assets/5415354/51ed66d3-ae4b-416d-a1a3-0192eea2b6e0)


## 參考資料
程式碼由　Boris　@　http://www.youtube.com/borispcp 設計。
