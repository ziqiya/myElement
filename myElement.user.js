// ==UserScript==
// @name         我的元素
// @namespace    https://github.com/RuanXuSong/myElement
// @version      1.2
// @description  用于在页面中插入元素，改变元素样式用于展示
// @author       Ruan Xusong
// @match        http://*/*
// @match        https://*/*
// @license      MIT
// @grant        none
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// ==/UserScript==

(function() {
  "use strict";
  $.noConflict(); // 兼容网页中$
  // dom加载完成后，运行jquery函数域
  jQuery(document).ready(function($) {
    // 全局的cardItem对象
    let domObj = {};
    /**
     * @功能描述: 初始化元素
     * @参数:
     * @返回值:
     */
    const initialCom = new InitialCom();
    // 初始化元素，插入元素
    initialCom.initialAll();

    // python生成功能
    //===start===

    /** 打开python表单 */
    $("#pythonBtn").click(function() {
      initialCom.pythonForm();
    });

    /** 启用/禁用链接跳转 */
    $("#hrefBtn").click(function() {
      // 切换链接模式
      initialCom.hrefToggle();
    });

    /** 清空python存储 */
    $("#clearBtn").click(function() {
      const ls = window.localStorage;
      ls.setItem("pythonObj", "");
      $(".selectBtn").text("请选择");
    });

    /** 查看并打印当前python */
    $("#inspectCurrentPython").click(function() {
      const ls = window.localStorage;
      let pythonString = ls.getItem("pythonObj");
      let pythonObj = pythonString ? JSON.parse(pythonString) : {};
      alert(pythonString);
      console.log(pythonObj);
    });

    /**
     * @功能描述: 点击按钮新增python input
     * @参数: 无
     * @返回值: 无
     */
    $(".addPythonBtn").click(function() {
      const datePoint = new Date().getTime();
      const attrFunc = new AttrFunc(datePoint);
      // 增加python项目
      attrFunc.appendPythonInput();
      // python名称改变事件
      $(`#pythonTitle${datePoint}`).change(attrFunc.pythonNameChange);
      // Dom选择内容点击事件
      $(`#pythonDom${datePoint}`).click(function() {
        attrFunc.pythonListen();
      });
      $(".pythonFormActive").click(function() {
        attrFunc.removePythonListen();
      });
    });

    /** 转换HTML为字符串 */
    function ToHtmlString(htmlStr) {
      return toTXT(htmlStr).replace(
        /\&lt\;br[\&ensp\;|\&emsp\;]*[\/]?\&gt\;|\r\n|\n/g,
        "<br/>"
      );
    }
    function toTXT(str) {
      var RexStr = /\<|\>|\"|\'|\&|　| /g;
      str = str.replace(RexStr, function(MatchStr) {
        switch (MatchStr) {
          case "<":
            return "&lt;";
            break;
          case ">":
            return "&gt;";
            break;
          case '"':
            return "&quot;";
            break;
          case "'":
            return "&#39;";
            break;
          case "&":
            return "&amp;";
            break;
          case " ":
            return "&ensp;";
            break;
          case "　":
            return "&emsp;";
            break;
          default:
            break;
        }
      });
      return str;
    }

    /** 取两个dom数组公共项 */
    function intersect(dom1, dom2) {
      return dom1.filter(function(num) {
        return Array.from(dom2).indexOf(num) !== -1;
      });
    }

    /** 获得node的string，参数:jquery节点 */
    function getNodeString(jqNode) {
      const nodeName = jqNode.nodeName.toLowerCase();
      const singleTags = ["img", "input", "area"];
      const attrArr = Array.from(jqNode.attributes);
      const attributes = attrArr.reduce((attrs, attr) => {
        attrs += `${attr.nodeName}="${attr.nodeValue}" `;
        return attrs;
      }, "");
      const nodeString = `<${nodeName} ${attributes}> ${
        !singleTags.includes(nodeName) ? `</${nodeName}>` : ""
      }`;
      return nodeString;
    }

    /** 拿到dom最小公共祖宗 */
    function getCommonParent(event1, event2) {
      const dom1 = $(event1.target);
      const dom2 = $(event2.target);
      const parents1 = Array.from(dom1.parents());
      // 包括dom1本身
      parents1.unshift(dom1[0]);
      const parents2 = Array.from(dom2.parents());
      // 包括dom2本身
      parents2.unshift(dom2[0]);
      const common = intersect(parents1, parents2)[0];
      const selectListDom = getNodeString(common);
      const firstSelect = dom1.parentsUntil($(common))[0]
        ? getNodeString(dom1.parentsUntil($(common))[0])
        : getNodeString(dom1);
      const lastSelect = dom2.parentsUntil($(common))[0]
        ? getNodeString(dom2.parentsUntil($(common))[0])
        : getNodeString(dom2);
      return {
        selectListDom,
        firstSelect,
        lastSelect
      };
    }

    /** 取card本身，并加入index，card->url的上级信息 */
    function getCardAndIndex(el) {
      // 鼠标事件
      const firstSelect = domObj.firstSelect;
      const lastSelect = domObj.lastSelect;
      const urlDom = $(el.target);
      const urlNodeName = urlDom[0].nodeName.toLowerCase();
      if (!firstSelect) {
        alert("请先选择第一个cardItem!");
        return {};
      }
      if (!lastSelect) {
        alert("请先选择最后一个cardItem!");
        return {};
      }
      // 获取选择的第一个，第二个listDom
      const dom1 = $(firstSelect.target);
      const dom2 = $(lastSelect.target);
      const parents1 = Array.from(dom1.parents());
      // 包括dom1本身
      parents1.unshift(dom1[0]);
      const parents2 = Array.from(dom2.parents());
      // 包括dom2本身
      parents2.unshift(dom2[0]);
      const common = intersect(parents1, parents2)[0];
      // 获取其在父级中的index
      const index = urlDom
        .parent()
        .children(urlNodeName)
        .index(urlDom);
      // url的dom本身的数组
      const urlDomArr = Array.from(urlDom);
      // 获取所有card到url元素到中间级
      const rangeArr = Array.from(urlDom.parentsUntil($(common)))
        .reverse()
        .concat(urlDomArr);
      let domString = "";
      rangeArr.forEach(item => {
        const nodeString = getNodeString(item);
        domString += nodeString;
      });
      const cardInfoItem = getNodeString(rangeArr.pop());
      return { pyDomString: domString, pyIndex: index, cardInfoItem };
    }

    /** 将html转换为可以存储的片段,替换<>间的"为' */
    function toStorageString(str) {
      var RexStr = /\<(.*)(")(.*)\>/g;
      str = str.replace(RexStr, function(MatchStr) {
        return MatchStr.replace(/"/g, "'");
      });
      return str;
    }

    /**
     * @功能描述: 获得url中的传参
     * @参数: name(指定项的key值)
     * @返回值: 若有name，则返回指定项的value，若没有name则返回一个query的json
     */
    function getUrlQuery(name) {
      let after = window.location.search || window.location.hash;
      after = after ? after.split("?")[1] : "";
      const query = {};
      const strs = after ? after.split("&") : [];
      for (let i = 0; i < strs.length; i++) {
        const keyValueMaps = strs[i] ? strs[i].split("=") : [];
        if (keyValueMaps.length === 2) {
          query[keyValueMaps[0]] = decodeURIComponent(keyValueMaps[1]);
        } else if (keyValueMaps[0]) {
          query[keyValueMaps[0]] = null;
        }
      }

      if (name && typeof name !== "object") {
        return query[name];
      }

      return query;
    }

    /**
     * @功能描述: 发送测试请求
     * @参数:
     * @返回值:
     */
    $(".testBtn").click(function() {
      const pythonKey = window.localStorage.getItem("pythonObj");
      let oldPythonObj = pythonKey ? JSON.parse(pythonKey) : {};
      const page = oldPythonObj.pageDom;
      const url = window.location.href;
      const hash = getUrlQuery("thundersData");
      const type = $(this).attr("id");
      const requestUrl = "http://192.168.1.116:5000";
      // 非分页详情的字段
      const infoOtherArr = [
        "firstSelect",
        "secondSelect",
        "url",
        "lastSelect",
        "selectListDom",
        "cardUrl",
        "pageDom",
        "infoUrl",
        "pyDomString",
        "pyIndex",
        "cardInfoItem"
      ];
      // 分页详情的name字段list
      const pageInfoNames = Object.keys(oldPythonObj).filter(item => {
        return !infoOtherArr.includes(item);
      });
      switch (type) {
        case "cardItemTest":
          const firstSelect = oldPythonObj.firstSelect;
          const lastSelect = oldPythonObj.lastSelect;
          const selectListDom = oldPythonObj.selectListDom;
          const pyDomString = oldPythonObj.pyDomString;
          const pyIndex = oldPythonObj.pyIndex;
          const cardInfoItem = oldPythonObj.cardInfoItem;
          $.ajax({
            url: `${requestUrl}/card`,
            type: "post",
            dateType: "json",
            headers: {
              "Content-Type": "application/json;charset=utf8"
            },
            data: JSON.stringify({
              need_data_list: [
                {
                  need_column: cardInfoItem,
                  need_type: "url",
                  need_tag: pyDomString,
                  need_tag_index: pyIndex
                }
              ],
              card_list: [firstSelect, lastSelect],
              start_url: url,
              root: selectListDom,
              hash: hash
            }),
            success: function(data) {
              alert(JSON.stringify(data.data));
            },
            error: function(data) {
              alert("请求错误!");
            }
          });
          break;
        case "pageTest":
          $.ajax({
            url: `${requestUrl}/page`,
            type: "post",
            dateType: "json",
            headers: {
              "Content-Type": "application/json;charset=utf8"
            },
            data: JSON.stringify({
              page,
              page_url: url,
              hash: hash
            }),
            success: function(data) {
              alert(JSON.stringify(data.data));
            },
            error: function(data) {
              alert("请求错误!");
            }
          });
          break;
        case "pageInfoTest":
          const dataList = pageInfoNames.map(name => ({
            need_column: name,
            need_type: "string",
            need_tag: oldPythonObj[name]
          }));
          $.ajax({
            url: `${requestUrl}/info`,
            type: "post",
            dateType: "json",
            headers: {
              "Content-Type": "application/json;charset=utf8"
            },
            data: JSON.stringify({
              need_data_list: dataList,
              info_url: url,
              hash: hash
            }),
            success: function(data) {
              alert(JSON.stringify(data.data));
            },
            error: function(data) {
              alert("请求错误!");
            }
          });
          break;
        default:
          break;
      }
    });

    /**
     * @功能描述: 点击python下载按钮
     * @参数:
     * @返回值:
     */
    $("#pythonDownload").click(function() {
      initialCom.pythonDownloadClick();
    });

    /**
     * @功能描述: 选择python字段类型
     * @参数:
     * @返回值:
     */
    $("#pythonType").change(function() {
      const pythonType = $(this).val();
      const datePoint = new Date().getTime();
      const attrFunc = new AttrFunc(datePoint);
      attrFunc.pythonTypeChange(pythonType);
    });

    // python生成功能
    //===end===

    /**
     * @功能描述:日期转换(长)
     * @参数: date
     * @返回值: 返回类似2019-08-17,19:18:10的字符串
     */

    function longDateFormate(dateObj) {
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const date = dateObj.getDate();
      const hour = dateObj.getHours();
      const minute = dateObj.getMinutes();
      const second = dateObj.getSeconds();
      return `${year}-${month < 10 ? "0" + month : month}-${date < 10 ? "0" + date : date},${hour < 10 ? "0" + hour : hour}：${minute < 10 ? "0" + minute : minute}：${second < 10 ? "0" + second : second}`;
    }

    /**
     * @功能描述: 属性事件构造函数
     * @参数:datePoint:唯一标识
     * @返回值:
     */
    function AttrFunc(datePoint) {
      this.selectedDom = "";
      this.idx = 0;
      this.innerFlag = false;
      this.domAlertId = "spyon-container";
      this.areaWrapId = "area-wrap-container";
      this.posBuffer = 3;
      this.appendInputLi = () => {
        let inputLi = `<li class="detailLi ${datePoint}"><input id='cssType${datePoint}'/><div class="fillFormColon">:</div><input cssType='' id='input${datePoint}'/></li>`;
        $("#siderBar .infoUl").append(inputLi);
      };
      this.appendPythonInput = () => {
        let inputLi = `<li class="fillFormLi ${datePoint}"><input id='pythonTitle${datePoint}' class="pythonName"/><div class="fillFormColon">:</div><button class="selectBtn" id='pythonDom${datePoint}'>请选择</button></li>`;
        $(".pageInfoUl").append(inputLi);
        $(".pythonEmptyBox").hide();
      };

      /** 新增默认python字段 */
      this.appendInitialInput = (type, selectArr) => {
        const _this = this;
        if (selectArr.length > 0) {
          selectArr.forEach(({ name, label }, idx) => {
            const modifiedDatePoint = datePoint + idx;
            let inputLi = `<div class="fillFormLabel">${label}:</div><li class="fillFormLi ${modifiedDatePoint}"><input id='pythonTitle${modifiedDatePoint}' value="${name}" disabled class="pythonName"/><div class="fillFormColon">:</div><button class="selectBtn" id='pythonDom${modifiedDatePoint}'>请选择</button></li>`;
            $(`.${type}Ul`).append(inputLi);
            $(".pythonEmptyBox").hide();
            // Dom选择内容点击事件
            $(`#pythonDom${modifiedDatePoint}`).click(function() {
              _this.idx = idx;
              _this.pythonListen();
            });
          });
        }
      };

      /**
       * @功能描述: python初始化
       * @参数:
       * @返回值:
       */
      this.pythonTypeChange = type => {
        let pythonSelect = [];
        switch (type) {
          case "cardItem":
            pythonSelect = [
              { name: "firstSelect", label: "第一个cardItem" },
              { name: "lastSelect", label: "最后一个cardItem" }
            ];
            break;
          case "cardInfo":
            pythonSelect = [{ name: "cardUrl", label: "链接" }];
            break;
          case "page":
            pythonSelect = [{ name: "pageDom", label: "分页器" }];
            break;
          case "pageInfo":
            break;
          default:
            break;
        }
        this.appendInitialInput(type, pythonSelect);
      };

      /** python-创造监听样式弹窗 */
      this.pythonCreate = () => {
        const div = document.createElement("div");
        const areaWrap = document.createElement("div");
        div.id = this.domAlertId;
        areaWrap.id = this.areaWrapId;
        div.setAttribute(
          "style",
          `
      position: absolute;
      left: 0;
      top: 0;
      width: auto;
      height: auto;
      padding: 10px;
      box-sizing: border-box;
      color: #fff;
      background-color: rgba(66,67,67,0.7);
      z-index: 100000;
      font-size: 12px;
      border-radius: 5px;
      line-height: 20px;
      max-width: 45%;
      text-align: left;
      `
        );
        areaWrap.setAttribute(
          "style",
          `
      position: absolute;
      left: 0;
      top: 0;
      width: auto;
      height: auto;
      padding: 0px;
      box-sizing: border-box;
      background-color: rgba(0,0,0,0.3);
      z-index: -10;
      border-radius: 5px;
      border:1px solid #ddd;
      `
        );
        document.body.appendChild(areaWrap);
        document.body.appendChild(div);
      };

      /** python-显示弹窗 */
      this.pythonShow = e => {
        const spyContainer = document.getElementById(this.domAlertId);
        const wrapContainer = document.getElementById(this.areaWrapId);
        if (!spyContainer) {
          this.pythonCreate();
          return;
        }
        if (spyContainer.style.display !== "block") {
          spyContainer.style.display = "block";
        }
        if (wrapContainer.style.display !== "block") {
          wrapContainer.style.display = "block";
        }
      };

      /** python-隐藏弹窗 */
      this.pythonHide = e => {
        document.getElementById(this.domAlertId).style.display = "none";
        document.getElementById(this.areaWrapId).style.display = "none";
      };

      /** python-获得srcoll的宽度高度 */
      this.getScrollPos = () => {
        const ieEdge = document.all ? false : true;
        if (!ieEdge) {
          return {
            left: document.body.scrollLeft,
            top: document.body.scrollTop
          };
        } else {
          return {
            left: document.documentElement.scrollLeft,
            top: document.documentElement.scrollTop
          };
        }
      };

      /** python-滑过元素 */
      this.pythonGlide = e => {
        const spyContainer = document.getElementById(this.domAlertId);
        const wrapContainer = document.getElementById(this.areaWrapId);
        if (!spyContainer) {
          this.pythonCreate();
          return;
        }
        const left = e.clientX + this.getScrollPos().left + this.posBuffer;
        const top = e.clientY + this.getScrollPos().top + this.posBuffer;
        const wrapLeft =
          e.target.getBoundingClientRect().left +
          document.documentElement.scrollLeft;
        const wrapTop =
          e.target.getBoundingClientRect().top +
          document.documentElement.scrollTop;
        const wrapWidth = e.target.offsetWidth;
        const wrapHeight = e.target.offsetHeight;
        spyContainer.innerHTML = this.showAttributes(e.target);
        wrapContainer.style.left = wrapLeft + "px";
        wrapContainer.style.top = wrapTop + "px";
        wrapContainer.style.width = wrapWidth + "px";
        wrapContainer.style.height = wrapHeight + "px";
        if (left + spyContainer.offsetWidth > window.innerWidth) {
          spyContainer.style.left = left - spyContainer.offsetWidth + "px";
        } else {
          spyContainer.style.left = left + "px";
        }
        spyContainer.style.top = top + "px";
      };

      /** python-获得dom属性 */
      this.showAttributes = el => {
        const nodeName = `${el.nodeName.toLowerCase()}`;
        // 单标签
        const singleTags = ["img", "input", "area"];
        const nodeNameDom = `<span style="font-weight:bold;">${nodeName}</span><br/>`;
        const attrArr = Array.from(el.attributes);
        const attributes = attrArr.reduce((attrs, attr) => {
          attrs += `${attr.nodeName}="${attr.nodeValue}" `;
          return attrs;
        }, "");
        const attributesDom = attrArr.reduce((attrs, attr) => {
          attrs += `<span style="color:#ffffcc;">${attr.nodeName}</span>="${attr.nodeValue}"<br/>`;
          return attrs;
        }, "");
        const htmlDom = `<div>&lt;${nodeName} ${attributes}&gt; ${ToHtmlString(
          el.innerHTML
        )} &lt;/${nodeName}&gt;</div><br/>`;
        this.selectedDom = `<${nodeName} ${attributes}> ${
          !singleTags.includes(nodeName)
            ? `${this.innerFlag ? el.innerHTML : ""} </${nodeName}>`
            : ""
        }`;
        return nodeNameDom + attributesDom + htmlDom;
      };

      /** python-存储点击的元素 */
      this.selectPythonDom = el => {
        const index = this.idx || 0;
        const ls = window.localStorage;
        const name = $(`#pythonTitle${datePoint + index}`).val();
        const itemArr = ["firstSelect", "lastSelect"];
        this.idx = 0;
        // 移除监听事件
        this.removePythonListen();
        if (name !== "") {
          const innerHTML = toStorageString(this.selectedDom);
          // 缓存中设置新的dom元素
          let oldPythonObj = ls.getItem("pythonObj")
            ? JSON.parse(ls.getItem("pythonObj"))
            : {};
          if (itemArr.includes(name)) {
            domObj[name] = el;
          }
          // 获取公共最小祖先
          if (domObj.firstSelect && domObj.lastSelect) {
            oldPythonObj = {
              ...oldPythonObj,
              ...getCommonParent(domObj.firstSelect, domObj.lastSelect)
            };
          }
          // 如果是card中的URL，取card本身，并加入index，card->url的上级信息
          if (name === "cardUrl") {
            oldPythonObj = {
              ...oldPythonObj,
              ...getCardAndIndex(el)
            };
          }

          ls.setItem(
            "pythonObj",
            JSON.stringify({
              ...oldPythonObj,
              [name]: innerHTML
            })
          );
          $(`#pythonDom${datePoint + index}`).text("已选择");
        } else {
          alert("请先输入name!");
        }
      };

      /**
       * @功能描述: 打开python监听当前元素
       * @参数:
       * @返回值:
       */
      this.pythonListen = () => {
        document.body.addEventListener("mousemove", this.pythonGlide);
        document.body.addEventListener("mouseover", this.pythonShow);
        document.body.addEventListener("mouseleave", this.pythonHide);
        document.body.addEventListener("mousedown", this.selectPythonDom);
      };

      /**
       * @功能描述:移除python监听元素
       * @参数:
       * @返回值:
       */
      this.removePythonListen = () => {
        document.body.removeEventListener("mousemove", this.pythonGlide);
        document.body.removeEventListener("mouseover", this.pythonShow);
        document.body.removeEventListener("mouseleave", this.pythonHide);
        document.body.removeEventListener("mousedown", this.selectPythonDom);
        document.getElementById(this.domAlertId).style.display = "none";
        document.getElementById(this.areaWrapId).style.display = "none";
      };
    }

    /**
     * @功能描述: 初始化事件构造函数
     * @参数:无
     * @返回值:无
     */
    function InitialCom() {
      this.ls = window.localStorage;
      this.hrefFlag = false;
      this.appendInputLi = () => {
        let inputLi = `<li class="detailLi ${datePoint}"><input id='cssType${datePoint}'/><div>:</div><input cssType='' id='input${datePoint}'/></li>`;
        $("#siderBar .infoUl").append(inputLi);
      };
      // 侧边栏div
      this.siderBarHtml = `
      <div id="siderBar">
        <div class="myelement-container">
          <div class="siderBarUlWrap">
            <ul class="siderBarUl">
               <div class="pythonWrap">
                <div class="fillFormInputWrap">
                  <div class="sectionTitle">cardItem</div>
                    <div class="cardItemUl pythonUl">
                    </div>
                  <div class="sectionTitle">cardInfo</div>
                    <div class="cardInfoUl pythonUl">
                    </div>
                    <button id="cardItemTest" class="testBtn">测试cardList</button>
                  <div class="sectionTitle">page</div>
                    <div class="pageUl pythonUl">
                    </div>
                    <button id="pageTest" class="testBtn">测试page</button>
                  <div class="sectionTitle">pageInfo</div>
                    <div class="pageInfoUl pythonUl">
                    </div>
                    <button id="pageInfoTest" class="testBtn">测试pageInfo</button>
                  <div class="pythonEmptyBox" style="display:none">
                    当前python为空，请先选择python字段类型，再点击新建，选择对应dom元素!
                  </div>
                  <div class="addPythonBtn">+</div>
                </div>
              </div>
              <div class="funcBtnWrap" style="bottom:60px">
                
                <div id="pythonDownload" class="downloadBtn"">下载Python</div>
                <div id="clearBtn" class="cancelBtn">清空Python</div>
                
                <div id="lineCancelBtn" class="cancelBtn">点击取消画线</div>
              </div>
              <div class="funcBtnWrap" style="bottom:34px">
                <div id="inspectCurrentPython" class="downloadBtn">查看Python</div>
                <div id="hrefBtn" class="fillFormBtn">允许跳转</div>
              </div>
            </ul>
          </div>
        </div>
			</div>`;

      // 收缩弹出按钮
      this.collapseBtn = $(`<div class="collapseBtn"><</div>`);

      this.initialAll = () => {
        // 清除上一个页面缓存
        this.ls.removeItem("siderBarCssObj");
        this.ls.removeItem("selectedElement");
        // 插入siderBar
        $("body").append(this.siderBarHtml);
        // 插入收缩弹出按钮
        this.appendCollapseBtn();
        // 导入CSS
        this.importCss();
        // 初始关闭状态
        this.toggleCollapse();

        // 禁用跳转
        this.hrefToggle();
        // 默认进入python页面
        this.pythonForm();
        // 初始化所有python下拉
        this.initialPython();
      };

      /** 初始化所有python下拉 */
      this.initialPython = () => {
        const typeArr = ["cardItem", "cardInfo", "page", "pageInfo"];
        typeArr.forEach(item => {
          const datePoint = new Date().getTime() + item;
          const attrFunc = new AttrFunc(datePoint);
          attrFunc.pythonTypeChange(item);
        });
      };

      /**
       * @功能描述: 启用/禁用跳转
       * @参数:
       * @返回值:
       */
      this.hrefToggle = () => {
        const _this = this;
        // 若为禁用跳转
        if (this.hrefFlag) {
          this.hrefFlag = false;
          $("#hrefBtn").text("禁止跳转链接");
        } else {
          this.hrefFlag = true;
          $("#hrefBtn").text("允许跳转");
        }
        $("a").click(function(e) {
          if (!_this.hrefFlag) {
            e.returnValue = true;
          } else {
            e.preventDefault();
          }
        });
      };

      /**
       * @功能描述:点击python下载按钮
       * @参数:
       * @返回值:
       */
      this.pythonDownloadClick = () => {
        const datePoint = longDateFormate(new Date());
        const contentObj = this.ls.getItem("pythonObj")
          ? this.ls.getItem("pythonObj")
          : "";
        const fileName = `${datePoint}下载的python`;
        this.createHref(fileName, contentObj);
      };

      /**
       * @功能描述:  创建下载文件的链接
       * @参数: fileName(string) 文件名 content(string)文件内容
       * @返回值:
       */
      this.createHref = (fileName, content) => {
        // 创建a标签
        const aTag = document.createElement("a");
        // 创建blob对象并给他内容
        const blob = new Blob([content]);
        // 给a标签下载文件名
        aTag.download = fileName;
        // 给a标签一个由URL方法转换blob来的下载链接
        aTag.href = URL.createObjectURL(blob);
        // 模拟点击
        aTag.click();
        // 注销blob的URL
        URL.revokeObjectURL(blob);
      };

      /**
       * @功能描述:点击退出删除按钮
       * @参数:
       * @返回值:
       */
      this.cancelBtnClick = _this => {
        $(_this)
          .removeClass("cancelDelete")
          .text("删除元素");
        $(".createdElement")
          .unbind("click")
          .css("cursor", "pointer");
        $(".lineConatiner")
          .unbind("click")
          .css("cursor", "pointer");
      };

      /**
       * @功能描述: 点击python按钮显示表单
       * @参数:
       * @返回值:
       */
      this.pythonForm = () => {
        const _this = this;
        $(
          ".fillFormWrap,#fillFormBtn,#cancelBtn,#downloadBtn,.elementListLi"
        ).hide();
        $(
          ".pythonWrap,#clearBtn,#inspectCurrentPython,#pythonDownload,#sendPython"
        ).show();
        $("#pythonBtn").addClass("pythonFormActive");
        $("#pythonBtn")
          .text("退出Python")
          .click(function() {
            $(
              "#pythonDownload,.pythonWrap,#clearBtn,#inspectCurrentPython,#sendPython"
            ).hide();
            $("#downloadBtn,.elementListLi,#fillFormBtn,#cancelBtn").show();
            $("#pythonBtn").text("生成Python");
            $(this).removeClass("pythonFormActive");
            $(this).click(function() {
              _this.pythonForm();
            });
          });
      };

      // 点击收缩按钮事件
      this.toggleCollapse = () => {
        // 若已经折叠，则打开
        if ($(".collapseBtn").hasClass("collapsed")) {
          $(".collapseBtn").removeClass("collapsed");
          $(".collapseBtn").text(">");
          $("#siderBar").css({
            right: "0px",
            height: "100%"
          });
          $(".siderBarUlWrap").show();
        } else {
          // 若未折叠，则折叠
          $(".collapseBtn").addClass("collapsed");
          $(".collapseBtn").text("<");
          $("#siderBar").css({
            right: "-184px",
            "min-height": "unset",
            height: "40px"
          });
          $(".siderBarUlWrap").hide();
        }
      };

      // 插入收缩弹出按钮
      this.appendCollapseBtn = () => {
        $("#siderBar").append(this.collapseBtn);
        $(".collapseBtn").click(() => {
          this.toggleCollapse();
        });
      };

      // 导入css样式
      this.importCss = () => {
        const cssString = `
      .detailLi input{width: 100%;}
      .sectionTitle{display:flex;color: #fff;font-size: 20px;text-shadow: 2px 2px 5px #333;font-weight: bold;margin-bottom: 8px;margin-top: 8px;justify-content:space-between;}
      #clearBtn,#inspectCurrentPython,#sendPython,#pythonDownload{display: none;}
      #pythonType{margin-bottom: 10px;outline: none;height: 22px;}
      .fillFormLabel{text-align: left;font-size: 14px;color: #fff;text-shadow: 2px 2px 5px #333;margin-bottom: 8px;}
      .siderBarUlWrap{display:flex;}
      .myelement-container{width: 90%;margin-left: 10%;}
      .testBtn{margin-bottom: 10px;height: 20px;line-height: 20px;}
      .selectBtn,.testBtn{width: 100%;background: #0189fb;color: #fff;cursor: pointer;border-radius: 4px;outline: none;border: 0;font-size: 14px;}
      #lineCancelBtn{display:none;z-index:10;position: absolute;width: 96%;}
      .fillFormWrap{display:none;width: 100%;}
      .pythonWrap{display:none;width: 100%;}
      .fillFormInputWrap{display: flex;flex-direction: column;width: 100%;}
      .fillFormLi{height: 22px;margin-bottom: 6px;display: flex;width: 100%;align-items: stretch;}
      .pythonName,.fillFormName,.fillFormInput{width: 100%;outline: none;padding-left: 4px;}
      .fillFormColon{color: #fff;margin: 0 2px;line-height: 20px;}
			.funcBtnWrap{display:flex;position: absolute;bottom: 8px;width: 100%;justify-content:space-between;}
			.collapseBtn{user-select: none;width: 20px;height: 20px;transform: translate(0px, 10px);background: rgba(255,255,255,0.6);text-align: center;border-radius: 10px;color: #333;font-weight: bold;line-height: 20px;cursor: pointer;position: absolute;left: 6px;top: 25%}
			.siderBarUl{width: 100%;position:relative;padding: 0;padding-bottom: 78px;display: flex;flex-direction: column;}
			.detailLi{display:flex;margin-bottom: 10px;border-bottom: 1px solid #eee;padding: 10px 0 5px 0;width: 100%;}
			.detailLi span{margin-right: 5px;color:#fff;text-align: right;white-space: nowrap;}
			.collapsed{top: 50%;transform: translate(0px, -50%);left:8px;}
			.fillFormBtn,.cancelBtn,.downloadBtn{flex:1;border-radius: 5px;font-size: 14px;color: #fff;background: #0189fb;text-align: center;height: 20px;line-height: 20px;margin: 0px 4px;cursor:pointer;white-space:nowrap;}
			.emptyBox,.pythonEmptyBox{color:#fff;margin-top: 20px;}
			.addPythonBtn{margin:20px auto;width: 50px;height: 20px;font-size: 20px;color: #fff;line-height: 20px;border-radius: 5px;background: #0189fb;text-align: center;cursor:pointer;}
      .infoUl,.pythonUl{width: 100%;padding: 0;display: flex;flex-direction: column;padding-bottom: 8px;}
			.elementListLi{background: #fff;list-style: none;height: 20px;line-height: 20px;padding-left: 10%;border-radius: 5px;margin-bottom: 10px;border: 0;cursor:pointer;border: 1px solid #fff;text-align:left;}
			.tabsBtn{color:#0189fb;border: 1px solid #fff;text-align:center;width:48%;flex: 1;background: #fff;border-radius: 5px 5px 0 0;cursor:pointer;}
			#siderBar{height: 100%;overflow: hidden;flex-direction: column;z-index: 100000;background: rgba(0,0,0,0.3);position: fixed;right: 0;top: 0;width: 200px;padding-bottom: 60px;border-radius: 0 5px 5px 0;padding: 10px;display:flex;transition:all 0.3s ease}`;
        var style = document.createElement("style");
        style.type = "text/css";
        if (style.stylesheet) {
          //IE
          style.stylesheet.cssText = cssString;
        } else {
          //w3c
          style.innerHTML = cssString;
        }
        var heads = document.getElementsByTagName("head");
        if (heads.length) {
          heads[0].appendChild(style);
        } else {
          document.documentElement.appendChild(style);
        }
      };
    }
  });
})();
