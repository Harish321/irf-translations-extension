var app = angular.module('translation', ['data-table'])
app.directive('translations', function () {
  return {
    restrict: "E",
    template: `<div>
                <div>
                <div class='bulk-trans'><textarea placeholder='Please copy bulk translations here....' id='bulkTransInput' class='bulkTransTextarea'></textarea></div>
                <div class='data-table'><dtable options="options" rows="data" class="material cdt-table"></dtable></div>
                <div action-top-box>
                <div class='option-box'>
                <div class='opt-div'>
                <button class='opt-btn' id='ctc' ng-click="ctcboard()">Copy to Clipboard</button>
                <button class='opt-btn' id='dsf' ng-click="sqldownload()">Download SQL File</button>
                <button class='opt-btn' id='bulkTrans' ng-click="bulkTrans()">Bulk Translation</button>
                <div class='divider'></div>
                <button class='opt-btn opt-delete' id='da' ng-click="deleteAll()">Delete All</button>
                <button class='opt-btn opt-delete' ng-click="deleteSession()">Delete Prev Session</button>
                </div>
                </div>
                </div>
                <div class='opt-hidden-div'>
                <button class='opt-btn'>Copy to Clipboard</button>
                <button class='opt-btn'>Download SQL File></button>
                <button class='opt-btn'>Copy/Download Selected</button>
                <button class='opt-btn'>Delete Selected</button>
                <button class='opt-btn'>Delete All</button>
                </div>
                </div>
            </div>`,
    controller: "translateController"
  }
})
app.controller('translateController', function ($scope, $q) {
  var global_trans = {};
  $scope.count = 0;
  $scope.options = {
    rowHeight: 50,
    headerHeight: 50,
    footerHeight: false,
    scrollbarV: false,
    selectable: false,
    columns: [{
        name: '',
        prop: 'check',
        width: 5,
        maxWidth: 5,
        cellRenderer: function () {
          return '<input class="check-box" ng-model="$cell" ng-click="checked($cell,$row,$column)" type="checkbox">'
        }
      },
      {
        name: "Translation",
        prop: "translate",
        width: 240,
        maxWidth: 240
      }, {
        name: "Value",
        prop: "value",
        width: 300,
        cellRenderer: function () {
          return '<input class="form-control" type="text" ng-model="$cell" ng-blur="changed($cell,$row,$column)">';
        },
        maxWidth: 300
      },
      {
        name:"",
        prop:"direct",
        maxWidth:5,
        width:5,
        cellRenderer: function () {
          return '<input class="check-box" value={{$cell}} ng-model="$cell" ng-click="direct($cell,$row,$column)" type="checkbox">'
        }
      },
      {
        name: '',
        prop: 'delete',
        cellRenderer: function () {
          return '<i class="fa fa-trash delete-icon" ng-click="delete($cell,$row,$column)"></i>'
        }
      }
    ]
  };

  var temp = {};
  $scope.data = [];
  chrome.storage.local.get(['translations'], function (data) {
    if (typeof data.translations != 'undefined') {
      global_trans = data.translations;
      Object.keys(data.translations).forEach(key => {
        $scope.data.push({
          "translate": data.translations[key].code,
          'value': data.translations[key].value ? data.translations[key].value : (((data.translations[key].code.split('_').map(x => x.split(' '))) + '').split(',').map(x => (x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())) + '').replace(/,/g, ' '),
          'session': data.translations[key].session,
          'check': true,
          'direct':true,
          'category': typeof data.translations[key].category != 'undefined' ? data.translations[key].category : '',
          'subCategory': typeof data.translations[key].subCategory != 'undefined' ? data.translations[key].subCategory : '',
        })
      })
    }
  })
  $scope.changed = function (v, r, c) {
    var id = $scope.data.indexOf(r);
    $scope.data[id].value = v;
    global_trans[r.translate].value = v;
    global_trans[r.translate].weight = 1;
    chrome.storage.local.set({
      'translations': global_trans
    }, function () {})
  }
  $scope.checked = function (v, r, c) {
    var id = $scope.data.indexOf(r);
    $scope.data[id].check = v;
    if (v == true) {
      $scope.count += 1;
      var ctc = document.getElementById('ctc');
      var da = document.getElementById('da');
      ctc.innerText = 'Copy Selected to Clipboard'
      da.innerText = 'Delete Selected'
    } else {
      if ($scope.count == 1) {
        $scope.count = 0;
        var ctc = document.getElementById('ctc');
        var da = document.getElementById('da');
        ctc.innerText = 'Copy to Clipboard'
        da.innerText = 'Delete All'
      } else {
        $scope.count -= 1
      }
    }
    console.log(v)
    console.log(r)
    console.log(c)
  }
  $scope.direct = function(v,r,c){
    var id = $scope.data.indexOf(r);
    $scope.data[id].direct = v;
  }
  $scope.delete = function (v, r, c) {
    var id = $scope.data.indexOf(r);
    delete global_trans[$scope.data[id].translate]
    $scope.data.splice(id, 1);
    chrome.storage.local.set({
      'translations': global_trans
    }, function () {})
  }
  $scope.deleteAll = function () {
    if ($scope.count > 0) {
      $scope.deleteData = $scope.data.filter((o) => {
        return o.check == true
      });
      $scope.data = $scope.data.filter((o) => {
        return o.check == false
      })
      for (var i = 0; i < $scope.deleteData.length; i++) {
        delete global_trans[$scope.deleteData[i].translate];
      }
      chrome.storage.local.set({
        'translations': global_trans
      });
    } else {
      if (confirm('Are you sure want to delete Data')) {
        chrome.storage.local.set({
          'translations': {}
        }, function () {})

        $scope.data = [];
      }
    }
  }
  $scope.deleteSession = function () {
    $scope.data = $scope.data.filter(function (o) {
      return o.session == 1;
    })
    for (var key in global_trans) {
      if (global_trans[key].session == 0) {
        delete global_trans[key];
      }
    }
    chrome.storage.local.set({
      'translations': global_trans
    });
  }
  $scope.ctcboard = function () {
    if ($scope.data.length > 0) {
      if ($scope.count > 0) {
        copyToClipboard(prepareQuery($scope.data.filter((o) => {
          return o.check == true
        })));
      } else {
        copyToClipboard(prepareQuery($scope.data));
      }
    }
  }
  var prepareQuery = function (arr, flag) {
    var txt = '';
    if (flag == 'c') {
      var indirectTranslate = '\n\\* ';
      var inderctCode = '\n\\* ';
      var pretxt = '\n\\*  ';
      var posttxt = '\n\\*  ';
      var banner = "\n\n \\*  *** Generated by Irf - Translation Extension *** "
    } else {
      var indirectTranslate = '\n-- ';
      var inderctCode = '\n-- ';
      var pretxt = '\n--  ';
      var posttxt = '\n--  ';
      var banner = "\n\n -- *** Generated by Irf -Translation Extension *** "
    }
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].direct){
        var category = arr[i].category != '' ? arr[i].category : 'FIELD_LABLE'
        var subCategory = arr[i].subCategory != '' ? arr[i].subCategory : ''
        txt += "INSERT IGNORE INTO `translations` (`label_code`, `category`, `sub_category`, `type`, `en`, `hi`, `ta`) VALUES ('" + arr[i].translate + "', '"+category+"', '"+subCategory+"', 'FIELD_LABEL', '" + arr[i].value + "', '', '');\n"
        pretxt += arr[i].translate + ','
        posttxt += arr[i].value + ','
      }
      else{
        indirectTranslate += arr[i].translate + ',';
        inderctCode += arr[i].value + ',';
      }
      
    }
    if (flag == 'c') {
      pretxt += '  */\n';
      posttxt += '  */\n';
      indirectTranslate += ' */\n';
      inderctCode += ' */\n';
    }
    return txt + pretxt + posttxt  +indirectTranslate +inderctCode + banner ;
  }

  function copyToClipboard(val) {
    console.log(val);
    var dummy = document.createElement("textarea");
    dummy.className += 'hidden-class';
    document.body.appendChild(dummy);
    dummy.setAttribute("id", "dummy_id");
    document.getElementById("dummy_id").value = val;
    dummy.select();
    chrome.runtime.sendMessage({
      msg: 'copy-now',
      data: {}
    }, function (response) {
      if (response.status == 'done')
        document.body.removeChild(dummy);
      showSuccess('Succesfully Copied to Clipboard')
    })
    document.execCommand("copy");
    document.getElementById('da');
  }
  $scope.update = function (data) {
    $scope.pleasework = data;
  }
  $scope.sqldownload = function () {
    if ($scope.data.length) {
      if ($scope.count > 0) {
        downloadFile(prepareQuery($scope.data.filter((o) => {
          return o.check == true
        })));
      } else {
        downloadFile(prepareQuery($scope.data));
      }
    }
  }

  function downloadFile(str) {
    var blob = new Blob([str], {
      type: "text/plain;charset=UTF-8"
    });
    var url = window.URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: 'translations.sql'
    })
  }

  function showSuccess(str) {
    var temp = document.createElement('div');
    var temp1 = document.createElement('div');
    temp1.className += 'success-msg-child';
    temp.className += 'success-msg';
    temp.appendChild(temp1);
    temp1.innerText = 'Copied Successfully :)';
    document.body.appendChild(temp);
    setTimeout(function () {
      document.body.removeChild(temp);
    }, 2000)
  }
  $scope.bulkTrans = function () {
    var bt = document.getElementById('bulkTransInput');
    var data = getTransBulk(bt.value);
    // chekc whether previous translations are ther
    //  throw error,
    // append to the scope
  }
  var getTransBulk = function (data) {
    var flag = 0;
    data = data.split('\n');
    for (var i=0;i<data.length;i++){
      data[i] = data[i].trim();
      data[i] = data[i].replace("'","\\'");
    }
    var trans = [];
    var cat = '';
    var subCat = '';
    for (var i = 0; i < data.length; i++) {
      if (data[i].includes('Missing Labels')){
        data.splice(i+1,1);
        continue;
      }
      else if (data[i].includes('.js') || data[i].includes('.json')) {
        flag = 0;
        if (data[i].includes('.js')) {
          var definition = data[i].split("definitions")
          if (definition.length > 1) {
            definition = definition[1].split('/');
            cat = definition[1];
          } else {
            definition = definition[0].split('/');
            flag = 1
          }
          for (var j = 0; j < definition.length; j++) {
            if (definition[j].includes('.js')) {
              subCat = definition[j].replace('.js', '');
              if (flag == 1) {
                cat = subCat;
              }
            }
          }
        } else if (data[i].includes('.json')) {
          var definition = line.split("schemas")
          if (definition.length > 1) {
            definition = definition[1].split('/');
          } else {
            definition = definition[0].split('/');
          }
          for (var j = 0; j < definition.length; j++) {
            if (definition[j].includes('.json')) {
              subCat = definition[j].replace('.json');
              cat = subCat;
            }
          }
        }
      } else {
        $scope.data.push({
          'translate': data[i],
          'value': processLabel(data[i]),
          'category': cat,
          'subCategory': subCat,
          'check': true,
          'session': 1
        })
        global_trans[data[i]] = {
          'code': data[i],
          'session': 1,
          'weight': 0,
          'category': cat,
          'subCategory': subCat
        }
      }
    }
  }

  function processLabel(word) {
    return (((word.split('_').map(x => x.split(' '))) + '').split(',').map(x => (x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())) + '').replace(/,/g, ' ')
  }
})
//  