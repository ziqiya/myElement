// ==UserScript==
// @name         我的元素
// @namespace    https://github.com/RuanXuSong/myElement
// @version      1.0
// @description  用于在页面中插入元素，改变元素样式用于展示
// @author       Ruan Xusong
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// ==/UserScript==

(function() {
  'use strict';
  /**
   * @功能描述: 初始化元素
   * @参数:
   * @返回值:
   */
  const initialCom = new InitialCom();
  // 初始化元素，插入元素
  initialCom.initialAll();

  // 一键填充功能
  //===start===

  /**
   * @功能描述: 一键填充表单按钮点击
   * @参数:
   * @返回值:
   */
  $('#fillFormBtn').click(function() {
    initialCom.fillForm();
  });

  /**
   * @功能描述: 改变填充表单名字input
   * @参数:
   * @返回值:
   */

  $('#fillFormName').change(function() {
    if ($('#fillFormInput').val() !== '') {
      // 一键填充表单值
      initialCom.handleFillInputChange();
    }
  });

  /**
   * @功能描述: 改变填充表单值input
   * @参数:
   * @返回值:
   */

  $('#fillFormInput').change(function() {
    if ($('#fillFormName').val() !== '') {
      // 一键填充表单值
      initialCom.handleFillInputChange();
    }
  });

  // 一键填充功能
  //===end===

  /**
   * @功能描述: 初始化事件构造函数
   * @参数:无
   * @返回值:无
   */
  function InitialCom() {
    this.ls = window.localStorage;
    // 侧边栏div
    this.siderBarHtml = `
      <div id="siderBar">
        <div class="container">
          <div class="siderBarUlWrap">
            <div class="fillFormWrap">
              <div class="fillFormInputWrap">
                <li class="fillFormLi">
                  <input id="fillFormName" class="fillFormName" placeholder="请输入key值"/>
                  <div class="fillFormColon">:</div>
                  <input id="fillFormInput" class="fillFormInput" placeholder="请输入value值"/>
                </li>
              </div>
              <textArea id="stringTextarea" autofocus placeholder="请输入JSON字符串,也可通过上方输入框自动生成,通过更改input可添加新的键值对"/>
            </div>
          </div>
        </div>
			</div>`;

    // 收缩弹出按钮
    this.collapseBtn = $(`<div class="collapseBtn"><</div>`);

    this.initialAll = () => {
      // 清除上一个页面缓存
      this.ls.removeItem('siderBarCssObj');
      this.ls.removeItem('selectedElement');
      // 插入siderBar
      $('body').append(this.siderBarHtml);
      // 插入收缩弹出按钮
      this.appendCollapseBtn();
      // 导入CSS
      this.importCss();
      // 初始关闭状态
      this.toggleCollapse();
    };

    /**
     * @功能描述: 点击一键表单填充按钮
     * @参数:
     * @返回值:
     */

    this.fillForm = () => {
      const _this = this;
      $('#fillFormBtn')
        .text('退出表单填充模式')
        .click(function() {
          $('#fillFormBtn').text('一键填充表单');
          $(this).click(function() {
            _this.fillForm();
          });
        });
      $('#stringTextarea').change(function() {
        _this.handleFillForm();
      });
    };

    /**
     * @功能描述: 一键表单填充功能
     * @参数:
     * @返回值:
     */

    this.handleFillForm = () => {
      try {
        const jsonObj = JSON.parse($('#stringTextarea').val());
        Object.entries(jsonObj).map(item => {
          const [name, val] = item;
          $(`#${name}`).val(val);
        });
      } catch (err) {
        alert('请先输入正确格式的JSON字符串！\n错误信息：' + err);
        return;
      }
    };

    this.handleFillInputChange = () => {
      // 若原JSON输入框内容为空,先初始化为{}
      if ($('#stringTextarea').val() === '') {
        $('#stringTextarea').val('{}');
      }
      try {
        // 原有string
        const originString = $('#stringTextarea').val();
        // 新key
        const attrName = $('#fillFormName').val();
        // 新val
        const attrVal = $('#fillFormInput').val();
        // 原有JSON
        const originJson = JSON.parse(originString);
        // 新增键值对或改掉原来的值
        originJson[attrName] = attrVal;
        const modifiedString = JSON.stringify(originJson);
        $('#stringTextarea').val(modifiedString);
        // 校验并填入表单的值
        this.handleFillForm();
      } catch (err) {
        alert('请先输入正确格式的JSON字符串！\n错误信息：' + err);
        return;
      }
    };

    // 点击收缩按钮事件
    this.toggleCollapse = () => {
      // 若已经折叠，则打开
      if ($('.collapseBtn').hasClass('collapsed')) {
        $('.collapseBtn').removeClass('collapsed');
        $('.collapseBtn').text('<');
        $('#siderBar').css({
          left: '0px',
          height: 'auto'
        });
      } else {
        // 若未折叠，则折叠
        $('.collapseBtn').addClass('collapsed');
        $('.collapseBtn').text('>');
        $('#siderBar').css({
          left: '-184px',
          height: '40px'
        });
      }
    };

    // 插入收缩弹出按钮
    this.appendCollapseBtn = () => {
      $('#siderBar').append(this.collapseBtn);
      $('.collapseBtn').click(() => {
        this.toggleCollapse();
      });
    };

    // 导入css样式
    this.importCss = () => {
      const cssString = `
      .container{width:90%;}
      .fillFormWrap{width:100%;}
      #stringTextarea{width: 98%;min-height: 68px;font-size: 12px;}
      .fillFormInputWrap{display: flex;flex-direction: column;width: 100%;}
      .fillFormLi{margin-bottom: 6px;display: flex;width: 100%;}
      .fillFormName,.fillFormInput{width: 100%;height: 20px;}
      .fillFormColon{color: #fff;margin: 0 2px;line-height: 20px;}
			.collapseBtn{user-select: none;width: 20px;height: 20px;transform: translate(0px, 10px);background: rgba(255,255,255,0.6);text-align: center;border-radius: 10px;color: #333;font-weight: bold;line-height: 20px;cursor: pointer;position: absolute;right: 2px;top: 25%;}
			.siderBarUl{width: 100%;padding: 0;display: flex;flex-direction: column;}
			.collapsed{top: 50%;transform: translate(0px, -50%);right:8px;}
			.fillFormBtn,.cancelBtn,.downloadBtn{flex:1;border-radius: 5px;font-size: 14px;background: #fff;text-align: center;height: 20px;line-height: 20px;margin: 0px 4px;cursor:pointer;}
			.fillFormBtn:hover,.cancelBtn:hover,.downloadBtn:hover{box-shadow: 0px 0px 10px #0189fb;}
			#siderBar{overflow: hidden;flex-direction: column;z-index:1000;background: rgba(0,0,0,0.3);position: fixed;left: 0;top: 10%;width: 200px;border-radius: 0 5px 5px 0;padding: 10px;display:flex;transition:all 0.3s ease}`;
      var style = document.createElement('style');
      style.type = 'text/css';
      if (style.stylesheet) {
        //IE
        style.stylesheet.cssText = cssString;
      } else {
        //w3c
        style.innerHTML = cssString;
      }
      var heads = document.getElementsByTagName('head');
      if (heads.length) {
        heads[0].appendChild(style);
      } else {
        document.documentElement.appendChild(style);
      }
    };
  }
})();
