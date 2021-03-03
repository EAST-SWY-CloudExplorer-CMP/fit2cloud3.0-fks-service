ProjectApp.service('operationArr', function () {
    this.removeByValue = function (arr, val) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === val) {
                arr.splice(i, 1);
                break;
            }
        }
    };
});

ProjectApp.service('ProhibitPrompts', function () {
    this.changeType = function (passwordId) {
        let passwordIdSelect = "#" + passwordId;
        let passwordElement = angular.element(passwordIdSelect);
        if (passwordElement[0].type === 'text') {
            passwordElement[0].type = 'password';
        }
    };
});