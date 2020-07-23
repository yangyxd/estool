var plugin = {};

plugin.install = function (Vue, options) {
  Vue.mixin({
    methods:{

      /**方法功能：
       * 获取一个随机字符串
       * @param number：返回字符串长度
       * */
      getRandomString(number) {
        let str = "qwertyuiopasdfghjklzxcvbnm123456789QWERTYUIOPLKJHGFDSAZXCVBNM";
        let tempString = "";
        for (let i = 0; i < number; i++) {
          let randomNum = parseInt(Math.random() * str.length);
          tempString += str[randomNum];
        }
        let date = new Date().getTime();
        return "random" + tempString + date;
      },

      // 对像拷贝
      assignObject(src) {
        return JSON.parse(JSON.stringify(src));
      },

      /**
       *方法功能
       * 根据type类型返回对应的日期
       * 参数：
       * type 日期类型[1="今天"，2="昨天",3="本周",4="本月", 5="近3天", 6="近30天", 7="本季", 8="本年",9="前面一个月到今天（29、30或者31天）", 10="上周", 11="上月", 12="上季",13="上年"]
       * fSuffix 开始日期后缀[0="没有后缀",1="00:00:00",2="23:59:59"]
       * eSuffix 结束日期后缀[0="没有后缀",1="00:00:00",2="23:59:59"]
       * 备注（20191118）:以下函数返回值中采用‘/’分隔，是因为ios移动端无法解析'-'，安卓可以
       */
      keyGetDateTime: function (type, fSuffix, eSuffix) {
        let date = new Date();
        let fs = "", es = "";
        switch (fSuffix) {
          case 1:
            fs = " 00:00:00";
            break;
          case 2:
            fs = " 23:59:59";
            break;
        }
        switch (eSuffix) {
          case 1:
            es = " 00:00:00";
            break;
          case 2:
            es = " 23:59:59";
            break;
        }
        let retDate = {};
        switch (parseInt(type, 10)) {
          case 1:
            return {
              "startTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs,
              "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es
            };
          case 2:
            date.setDate(date.getDate() - 1);
            return {
              "startTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs,
              "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es
            };
          case 3:
            date.setDate(date.getDate() - date.getDay() + 1);
            retDate = { "startTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs };
            date.setDate(date.getDate() + 6);
            retDate["endTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es;
            return retDate;
          case 4:
            date.setDate(1);
            retDate = { "startTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs };
            date.setMonth(date.getMonth() + 1);
            date.setDate(date.getDate() - 1);
            retDate["endTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es;
            return retDate;
          case 5:
            retDate = { "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es };
            date.setDate(date.getDate() - 2);
            retDate["startTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs;
            return retDate;
          case 6:
            retDate = { "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es };
            date.setDate(date.getDate() - 29);
            retDate["startTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs;
            return retDate;
          case 7:
            var quarter = Math.ceil((date.getMonth() + 1) / 3);
            var list = {
              1: ['1/1', '3/31'],
              2: ['4/1', '6/30'],
              3: ['7/1', '9/30'],
              4: ['10/1', '12/31']
            };
            return {
              "startTime": date.getFullYear() + "/" + list[quarter][0] + fs,
              "endTime": date.getFullYear() + "/" + list[quarter][1] + es
            };
          case 8:
            return {
              "startTime": date.getFullYear() + "/1/1" + fs,
              "endTime": date.getFullYear() + "/12/31" + es
            };
          case 9:
            retDate = { "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es };
            date.setMonth(date.getMonth() - 1);
            date.setDate(date.getDate() + 1);
            retDate["startTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs;
            return retDate;
          case 10:
            date.setDate(date.getDate() - date.getDay());
            let retDate = { "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es };
            date.setDate(date.getDate() - 6);
            retDate["startTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs;
            return retDate;
          case 11:
            date.setDate(1);
            date.setDate(date.getDate() - 1);
            retDate = { "endTime": date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + es };
            date.setDate(1);
            retDate["startTime"] = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + fs;
            return retDate;
          case 12:
            var quarter = Math.floor((date.getMonth() + 1) / 3)
            var list = {
              1: ['1/1', '3/31'],
              2: ['4/1', '6/30'],
              3: ['7/1', '9/30'],
              4: ['10/1', '12/31']
            }
            return {
              "startTime": date.getFullYear() + "/" + list[quarter][0] + fs,
              "endTime": date.getFullYear() + "/" + list[quarter][1] + es
            };
          case 13:
            let lastYear = date.getFullYear() - 1;
            return {
              "startTime": lastYear + "/1/1" + fs,
              "endTime": lastYear + "/12/31" + es
            };
        }
      },

      /**
       * 当前时间戳
       * @returns {number}
       */
      curTimestamp: function () {
        return new Date().getTime() / 1000; //获取时间戳 并返回
      },

      dateToTimestamp: function (date) {
        return date.getTime() / 1000;
      },

      /**
       * 当前时间字符串 (yyyy-mm-dd hh:mm:ss)
       * @returns {string}
       */
      curDateTimeStr: function () {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let second = date.getSeconds();
        return year + "-" + this.addZero(month + 1) + "-" + this.addZero(day) + " " + this.addZero(hour) + ":" + this.addZero(minutes) + ":" + this.addZero(second);
      },

      /**
       * 去掉时间字符串中的秒
       * @param value
       */
      timeRemoveSec: function(value, dateFormat) {
        try {
          return this.dateMagic(this.dateMagic(value), dateFormat ? dateFormat : 'yyyy-mm-dd hh:mm');
        } catch (e) {
          return value;
        }
        //return /\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}/g.exec(value)[0];
      },

      // 格式化物料类型
      formatMatterType(row, type) {
        if (row.mtype >= 0 && row.mtype < this.$const.sMatterType.length)
          return this.$const.sMatterType[row.mtype].name;
        return this.$const.sCP;
        return row.mtype === 99 ? (type === 0 ? "存皮" : '重车过磅') : "未知";
      },
      // 格式化数量
      formatQty(row) {
        return this.roundQty(row.qty, 1);
      },

      /**
       * 方法功能：
       * 时间戳 转 时间，或者 时间 转 时间戳
       * data: 时间 或 时间戳
       * dataFormat:你需要的 时间格式 默认为：yyyy-mm-dd hh:mm:ss
       * dateStartEnd:事件的 开始或者结束 有值或为true 就是结束，没有值或者false 就是 开始
       * */
      dateMagic: function (data, dataFormat, dateStartEnd) {
        /*如果 data 里面不包含 - / ： 其中任何一种 我们直接认为是 时间戳*/
        if (
          !isNaN(data) || (
            data.indexOf("-") == -1 &&
            data.indexOf("/") == -1 &&
            data.indexOf(":") == -1
          )
        ) {
          if (!isNaN(data))
            data = parseInt(data);
          let date = new Date(data * 1000);

          let year = date.getFullYear();
          let month = date.getMonth();
          let day = date.getDate();
          let hour = date.getHours();
          let minutes = date.getMinutes();
          let second = date.getSeconds();

          /**
           * 处理不同时期格式返回
           * 默认为 yyyy-mm-dd
           * */
          if (dataFormat == "yyyy-mm-dd") {
            return year + "-" + this.addZero(month + 1) + "-" + this.addZero(day);
          } else if (dataFormat == "yyyy/mm/dd") {
            return year + "/" + this.addZero(month + 1) + "/" + this.addZero(day);
          } else if (dataFormat == "yyyy/mm/dd hh:mm") {
            return year + "/" + this.addZero(month + 1) + "/" + this.addZero(day) + " " + this.addZero(hour) + ":" + this.addZero(minutes);
          } else if (dataFormat == "yyyy-mm-dd hh:mm") {
            return year + "-" + this.addZero(month + 1) + "-" + this.addZero(day) + " " + this.addZero(hour) + ":" + this.addZero(minutes);
          } else if (dataFormat == "yyyy-mm-dd hh:mm:ss") {
            return year + "-" + this.addZero(month + 1) + "-" + this.addZero(day) + " " + this.addZero(hour) + ":" + this.addZero(minutes) + ":" + this.addZero(second);
          } else if (dataFormat == "yyyy/mm/dd hh:mm:ss") {
            return year + "/" + this.addZero(month + 1) + "/" + this.addZero(day) + " " + this.addZero(hour) + ":" + this.addZero(minutes) + ":" + this.addZero(second);
          } else {
            //return year + "-" + this.addZero(month + 1) + "-" + this.addZero(day);
            return year + "-" + this.addZero(month + 1) + "-" + this.addZero(day) + " " + this.addZero(hour) + ":" + this.addZero(minutes) + ":" + this.addZero(second);
          }
        } else {
          if (data.indexOf("/") != -1) {
           data = data.replace(/-/g,'/');
          }
          let date = null;
          if (data.indexOf(":") != -1) {
            date = new Date(data.replace(/-/g,'/'));
          } else {
            if (dateStartEnd) {
              date = new Date((data + " 23:59:59").replace(/-/g,'/'));
            } else {
              date = new Date((data + " 00:00:00").replace(/-/g,'/'));
            }
          }
          //alert(data + " 23:59:59");
          return date.getTime() / 1000;//获取时间戳 并返回
        }
      },

      /**方法功能：
       * 给数据进行添 0 操作
       * 参数：
       * number：需要添加的数
       * type:保留
       * */
      addZero: function (number, type) {
        if (parseInt(number) < 10) {
          return "0" + number;
        } else {
          return number;
        }
      },

        /**
         * 数量
         * 四舍五入 保留小数的位数
         * 根据vuex 里面的 小数点位数
         * */
        roundQty: function (number, decimal) {
            if (typeof (number) != "number") number = Number(number);
            if (isNaN(number)) return 0;
            let v = parseFloat((Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal)).toFixed(decimal));
            return isNaN(v) ? 0 : v;
        },

      /**
       * 重量
       * 四舍五入 保留小数的位数
       * 根据vuex 里面的 小数点位数
       * */
      roundWeight: function (value) {
        if (typeof(value) == 'number')
          return this.roundQty(value, 0);
        return value;
      },

      /**
       * 搜索数组指定字段， 返回给定字段的值
       * @param items
       * @param findKey
       * @param outKey 要返回的列表项的key,如果不指定，则返回整个列表项对象
       * @param val
       * @returns {undefined|*}
       */
      findArrayFirst: function (items, findKey, outKey, val) {
         if (items && val != undefined && items.length > 0) {
           for (let i=0; i<items.length; i++) {
             if (items[i] && items[i][findKey] == val) {
               if (outKey == undefined)
                 return items[i];
               return items[i][outKey];
             }
           }
         }
         return undefined;
      },

      /**
       * 用于数字输入框在input方法中控制精度的实现逻辑
       * @param value 当前的数字，必填
       * @param decimal 精度，为正整数
       * @param isPositive 是否为正数 布尔值
       * @param isRound 是否四舍五入，默认为false，此时只做位数输入控制，不做进位
       * @return {string} 返回的数字
       * @constructor
       */
      NumberInputChangeControlDecimal(value, decimal, isPositive, isRound) {
        if (!isRound) {
          isRound = false
        }

        let newValue = value.toString().replace();
        decimal = parseInt(decimal);
        if (newValue !== '') {
          if (/^[\d|.|-]+$/.test(newValue) && /[-|\d]/.test(newValue[0])) {
            // 首位字符
            let firstNum = newValue[0]
            // 其他字符
            let nextNum = newValue.substring(1)
            // 首位字符为负号，其他字符的逻辑
            if (firstNum === '-') {
              if (isPositive) {
                firstNum = firstNum.replace(/-/g, '');
              }
              nextNum = nextNum.replace(/-/g, '')
              nextNum = nextNum.replace(/^\./, '')
            } else {
              // 替换掉nextNum中所有的负号
              nextNum = nextNum.replace(/-/g, '')
              if (/\d/.test(nextNum[0]) && firstNum === '0') {
                firstNum = '';
              }
            }
            // 精度为0时，控制小数点的输入
            if (decimal === 0) {
              nextNum = nextNum.replace(/\./g, '')
            }
            // 处理.的个数问题
            let spotArr = nextNum.split('.')
            let spotLen = spotArr.length - 1
            if (spotLen >= 1) {
              if (spotArr[1].length > decimal) {
                if (isRound === true) {
                  nextNum = spotArr[0] + '.' + spotArr[1].slice(0, decimal);
                } else {
                  let decimalNum = spotArr[1].slice(0, decimal + 1)
                  // 给小数第一位补1，保证为0不会被number处理掉
                  decimalNum = '1' + decimalNum
                  // 对于末尾四舍五入
                  decimalNum = parseInt((decimalNum / 10).toFixed(0)).toString()

                  if (decimalNum[0] === '2') {
                    // 模拟类似于1.999末尾四舍五入为2的情况
                    nextNum = Number(spotArr[0]) + 1
                  } else if (Number(decimalNum) / Math.pow(10, decimal) === 1) {
                    // 模拟类似末尾1.001末尾四舍五入为1的情况
                    nextNum = spotArr[0]
                  } else {
                    // 首位为1，且其他位不都为0的情况
                    nextNum = spotArr[0] + '.' + decimalNum.slice(1)
                  }
                }
              } else {
                nextNum = spotArr[0] + '.' + spotArr[1]
              }
            }
            newValue = firstNum + nextNum
          } else {
            newValue = newValue.replace(/\D/g, '')
          }
        }
        return newValue;
      },
    },
  });
};

export default plugin;
