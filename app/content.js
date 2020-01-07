window.addEventListener('contextmenu', e => {
    if (e.target.className != 'breadcrumb' && e.target.parentElement.className != 'breadcrumb' && e.target.parentElement.parentElement.className != 'breadcrumb') {
        chrome.runtime.onMessage.addListener(mylistner)
        function mylistner(request, sender, sendResponse) {
            chrome.storage.local.get(['translations'],function(value){
                translations = {};
                if(value.translations){
                    translations = value.translations;
                }
                if(e.target.getAttribute('ac-tran')){
                    var code = e.target.getAttribute('ac-tran');
                    var value = (((code.split('_').map(x => x.split(' '))) + '').split(',').map(x => (x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())) + '').replace(/,/g, ' ')
                    translations[code] = {
                        code :code,
                        value:value,
                        direct:true
                    }
                }
                else{
                    var direct = false;
                    if(!e.target.innerHTML)
                        code = e.target.value;
                    else 
                        code = e.target.innerHTML;
                    if(code.includes('_')){
                        direct = true;   
                    }
                    var code = code;
                    var value = (((code.split('_').map(x => x.split(' '))) + '').split(',').map(x => (x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())) + '').replace(/,/g, ' ');
                    translations[code] = {
                        code :code,
                        value:value,
                        direct:direct
                    }
                    if(!e.target.innerHTML){
                        e.target.value = value;
                    }
                    else{
                        e.target.innerHTML  = value;
                    }
                }
                chrome.storage.local.set({'translations':translations},function(){});
            })
            chrome.runtime.onMessage.removeListener(mylistner);
        }
    }
})