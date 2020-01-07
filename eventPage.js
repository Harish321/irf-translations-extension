var menuItem = {
    "id": "irf-translate",
    "title": "Irf-Translation",
    "contexts": ["selection"]
};
chrome.contextMenus.create(menuItem);
chrome.contextMenus.onClicked.addListener(function(clickData){  
    if (clickData.menuItemId == "irf-translate" && clickData.selectionText){    
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {text: clickData.selectionText}, function(response) {
            //   console.log(response.farewell);
            });
          });
    }
});
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    if(request.msg == 'copy-now'){
        document.execCommand('copy');
        sendResponse({status:'done'});
    }
    else{

    }
})
chrome.runtime.onStartup.addListener(function(){
    chrome.storage.local.get(['translations'],function(data){
        if (data.translations){
            for (var key in data.translations) {
                if (data.translations.hasOwnProperty(key)) {
                  data.translations[key].session = 0;
                }
            }
            chrome.storage.local.set({'translations':data.translations})
        }
    })
})
