window.addEventListener('contextmenu', e => {
    if (e.target.className != 'breadcrumb' && e.target.parentElement.className != 'breadcrumb' && e.target.parentElement.parentElement.className != 'breadcrumb') {
        chrome.runtime.onMessage.addListener(mylistner)
        function mylistner(request, sender, sendResponse) {
            var p = (((request.text.split('_').map(x => x.split(' '))) + '').split(',').map(x => (x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())) + '').replace(/,/g, ' ')
            var text = e.target.innerHTML || '';  
            if (text.includes(request.text)){
                text = text.replace(request.text,p);
                e.target.innerHTML = text;
            }
            chrome.runtime.onMessage.removeListener(mylistner);
        }

    }
})