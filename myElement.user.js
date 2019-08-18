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

	/**
	 * @功能描述: 删除元素
	 * @参数:
	 * @返回值:
	 */
	$('#cancelBtn').click(function() {
		if (!$(this).hasClass('cancelDelete')) {
			initialCom.deleteBtnclick(this);
		} else {
			initialCom.cancelBtnClick(this);
		}
	});

	/**
	 * @功能描述: 点击切换列表
	 * @参数: 无
	 * @返回值: 无
	 */
	$('.tabsBtnWrap .tabsBtn').click(function() {
		initialCom.tabsSwitchIndex($(this).index());
	});

	/**
	 * @功能描述: 点击下载按钮
	 * @参数:
	 * @返回值:
	 */

	$('.downloadBtn').click(function() {
		initialCom.downloadBtnclick();
	});

	/**
	 * @功能描述: 点击按钮新增属性input
	 * @参数: 无
	 * @返回值: 无
	 */
	$('.addInfoBtn').click(function() {
		const datePoint = new Date().getTime();
		const attrFunc = new AttrFunc(datePoint);
		if ($('.infoUl li').length > 0) {
			attrFunc.appendInputLi();
			// 属性名称改变事件
			$(`#cssType${datePoint}`).change(attrFunc.cssTypeChange);
			// 属性内容改变事件
			$(`#input${datePoint}`).change(attrFunc.contentChange);
		} else {
			alert('当前属性为空，请先新建实例元素，再双击选择添加属性!');
		}
	});

	/**
	 * @功能描述: 点击页面中插入列表元素
	 * @参数: 无
	 * @返回值: 无
	 */
	$('.elementListLi').click(function() {
		const datePoint = new Date().getTime();
		const elementFunc = new ElementFunc(datePoint);
		let lineFlag = false;
		let type = $(this).attr('type');
		// 解绑上次的线点击事件
		elementFunc.cancelBind();
		if (type === 'line') {
			elementFunc.cancelDrawLine();
			lineFlag = true;
		} else {
			const initialStyle = $(this).attr('initialStyle');
			// 文字内容
			const content = $(this).attr('content');
			// 创建元素
			const element = elementFunc.createEle(datePoint, type, content, initialStyle);
		}

		// 线-绑定全局鼠标点击事件
		if (lineFlag) {
			const lineFunc = new ElementFunc('');
			// 生成线条消抖
			setTimeout(function() {
				$('body').bind('click', lineFunc.handleLineClick);
			}, 100);
		} else {
			// 绑定element鼠标点击事件
			$(`#${datePoint}`).bind('mousedown', elementFunc.elementMousedown);
			// 绑定松开鼠标事件
			$(`#${datePoint}`).bind('mouseup', function() {
				$('body').unbind('mousemove');
			});
			// 绑定双击事件
			$(`#${datePoint}`).dblclick(elementFunc.elementDblclick);
		}
	});

	/**
	 * @功能描述: json字符串转css
	 * @参数: json的字符串
	 * @返回值:css的字符串
	 */

	function jsonToCss(json) {
		let cssString = '{';
		Object.keys(json).map(item => {
			cssString += `${item}:${json[item]};`;
		});
		cssString += '}';
		return cssString;
	}

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
		return `${year}-${month < 10 ? '0' + month : month}-${date < 10 ? '0' + date : date},${
			hour < 10 ? '0' + hour : hour
		}：${minute < 10 ? '0' + minute : minute}：${second < 10 ? '0' + second : second}`;
	}

	/**
	 * @功能描述:日期转换(短)
	 * @参数: date
	 * @返回值: 返回类似19时18分10秒的字符串
	 */

	function shortDateFormate(dateObj) {
		const hour = dateObj.getHours();
		const minute = dateObj.getMinutes();
		const second = dateObj.getSeconds();
		return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:${
			second < 10 ? '0' + second : second
		}`;
	}

	/**
	 * @功能描述: 画点函数
	 * @参数:key:唯一标识位，x:x坐标,y:y坐标,color:点颜色
	 * @返回值:画线时返回点容器
	 */
	function drawDot(key, x, y, color, dotContainer) {
		const dotDiv = `<div class="line${key}" style="background:${color ||
			'#000'};position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;transform:translate(-50%,-50%);border-radius: 100%;z-index:1000"></div>`;
		if (dotContainer) {
			$(dotContainer).append(dotDiv);
			return $(dotContainer);
		} else {
			$(`#lineConatiner${key}`).append(dotDiv);
		}
	}

	/**
	 * @功能描述: 画线函数
	 * @参数:key:唯一标识位，x1:起点x坐标,y1:起点y坐标,x2:终点x坐标,y2:终点y坐标,color:线颜色,lineType:dotted(为dotted的时候为虚线，默认实线)
	 * @返回值:无
	 */
	function drawLine(key, x1, y1, x2, y2, color, lineType) {
		let dotContainer = `<div class="dotContainer${key}"></div>`;
		// 线长度
		const lineLength = Math.floor(Math.sqrt(Math.abs((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))));
		// 初始化间隔为实线
		const initialPadding = 1;
		// 间隔
		const padding = lineType && lineType === 'dotted' ? 8 : initialPadding;
		// 每一次变化的x,y值
		const stepX = (Math.abs(x2 - x1) / lineLength) * padding;
		const stepY = (Math.abs(y2 - y1) / lineLength) * padding;
		for (let i = 0; i <= lineLength / padding; i++) {
			let drawX;
			let drawY;
			if (x2 > x1) {
				drawX = x1 + i * stepX;
			} else {
				drawX = x1 - i * stepX;
			}
			if (y2 > y1) {
				drawY = y1 + i * stepY;
			} else {
				drawY = y1 - i * stepY;
			}
			dotContainer = drawDot(key, drawX, drawY, color, dotContainer);
			if (i === Math.floor(lineLength / padding)) {
				$(`#lineConatiner${key}`).append(dotContainer);
			}
		}
	}

	/**
	 * @功能描述: 属性事件构造函数
	 * @参数:datePoint:唯一标识
	 * @返回值:
	 */
	function AttrFunc(datePoint) {
		this.appendInputLi = () => {
			let inputLi = `<li class="detailLi ${datePoint}"><input id='cssType${datePoint}'/><div>:</div><input cssType='' id='input${datePoint}'/></li>`;
			$('#siderBar .infoUl').append(inputLi);
		};
		/**
		 * @功能描述: 改变css名称的事件
		 * @参数:
		 * @返回值:
		 */
		this.cssTypeChange = function() {
			const ls = window.localStorage;
			$(`#input${datePoint}`).attr('cssType', $(this).val());
			if ($(`#input${datePoint}`).val() !== '') {
				const selectedElement = ls.getItem('selectedElement');
				if (selectedElement !== '') {
					if ($(`#input${datePoint}`).attr('cssType') !== '') {
						const cssType = $(`#input${datePoint}`).attr('cssType');
						const val = $(`#input${datePoint}`).val();
						// 缓存中设置新的CSS样式
						let oldSiderBarCssObj = JSON.parse(ls.getItem('siderBarCssObj'));
						let oldCssObj = oldSiderBarCssObj[selectedElement] || {};
						let newCssObj = { ...oldCssObj, [cssType]: val };
						ls.setItem(
							'siderBarCssObj',
							JSON.stringify({
								...oldSiderBarCssObj,
								[selectedElement]: newCssObj,
							})
						);
						$(`#${selectedElement}`).css(cssType, val);
					} else {
						alert('请先选择style名称！');
					}
				} else {
					alert('请先双击选择实例元素！');
				}
			}
		};
		/**
		 * @功能描述: 改变css内容的事件
		 * @参数:
		 * @返回值:
		 */
		this.contentChange = function() {
			const ls = window.localStorage;
			const selectedElement = ls.getItem('selectedElement');
			if (selectedElement !== '') {
				if ($(this).attr('cssType') !== '') {
					const cssType = $(this).attr('cssType');
					const val = $(this).val();

					// 缓存中设置新的CSS样式
					let oldSiderBarCssObj = JSON.parse(ls.getItem('siderBarCssObj'));
					let oldCssObj = oldSiderBarCssObj[selectedElement] || {};
					let newCssObj = { ...oldCssObj, [cssType]: val };
					ls.setItem(
						'siderBarCssObj',
						JSON.stringify({
							...oldSiderBarCssObj,
							[selectedElement]: newCssObj,
						})
					);
					$(`#${selectedElement}`).css(cssType, val);
				}
			} else {
				alert('请先双击选择实例元素！');
			}
		};
	}

	/**
	 * @功能描述: 元素事件构造函数
	 * @参数:datePoint:唯一标识
	 * @返回值:
	 */
	function ElementFunc(datePoint) {
		this.o = {};
		this.ls = window.localStorage;
		// 直线位置对象
		this.lineObj = {};
		// 直线标识名
		this.lineDatePoint = '';

		/**
		 * @功能描述: 创造元素
		 * @参数: key:唯一标识,type:类型,content：内容,initialStyle:初始样式字符串
		 * @返回值: 无
		 */
		this.createEle = (key, type, content, initialStyle) => {
			// 生成元素
			const element = document.createElement(type);
			// 生成文字节点
			const contentNode = document.createTextNode(content);
			element.setAttribute('style', initialStyle);
			element.setAttribute('id', key);
			element.setAttribute('class', 'createdElement');
			element.appendChild(contentNode);
			$('body').append(element);
		};

		// 点击元素事件
		this.elementMousedown = e => {
			const position = $(`#${datePoint}`).position();
			this.o.initialX = e.clientX;
			this.o.initialY = e.clientY;
			this.o.initialLeft = position.left;
			this.o.initialTop = position.top;
			// 绑定移动事件
			$('body').bind('mousemove', this.bodyMousemove);
		};

		// 点击元素以后鼠标移动
		this.bodyMousemove = e => {
			let mouseLeft = event.clientX;
			let mouseTop = event.clientY;
			let elementLeft = this.o.initialLeft + mouseLeft - this.o.initialX;
			let elementTop = this.o.initialTop + mouseTop - this.o.initialY;
			$(`#${datePoint}`).css({ left: elementLeft, top: elementTop });
		};

		// 双击元素事件
		this.elementDblclick = () => {
			this.ls.setItem('selectedElement', datePoint);
			// 清除原先input
			$('.detailLi').remove();
			// 清除空提示
			$('.emptyBox').hide();
			// localStorage的css初始化
			if (!this.ls.getItem('siderBarCssObj')) {
				this.ls.setItem('siderBarCssObj', JSON.stringify({}));
			}

			// 详情属性列表
			const lsdetailObj = JSON.parse(this.ls.getItem('siderBarCssObj'))[datePoint];
			const initialList = ['text', 'color', 'width', 'height', 'background'];
			const detailList = lsdetailObj && JSON.stringify(lsdetailObj) !== '{}' ? Object.keys(lsdetailObj) : initialList;
			// 插入详情list元素
			detailList.map((item, idx) => {
				const mixedId = datePoint + idx;
				const _this = this;
				let modifyLi = `<li class="detailLi ${datePoint}"><span>${item}:</span><input cssType=${item} id='input${mixedId}' value="${
					lsdetailObj && lsdetailObj !== {} && lsdetailObj[item] ? lsdetailObj[item] : ''
				}"/></li>`;
				let initialLi = `<li class="detailLi ${datePoint}"><span>${item}:</span><input cssType=${item} id='input${mixedId}'/></li>`;
				let detailLi = lsdetailObj && lsdetailObj !== {} ? modifyLi : initialLi;
				$('#siderBar .infoUl').append(detailLi);
				$(`#input${mixedId}`).on('change', function() {
					const cssType = $(this).attr('cssType');
					const val = $(this).val();

					// 缓存中设置新的CSS样式
					let oldSiderBarCssObj = JSON.parse(_this.ls.getItem('siderBarCssObj'));
					let oldCssObj = JSON.parse(_this.ls.getItem('siderBarCssObj'))[datePoint] || {};
					let newCssObj = { ...oldCssObj, [cssType]: val };
					_this.ls.setItem(
						'siderBarCssObj',
						JSON.stringify({
							...oldSiderBarCssObj,
							[datePoint]: newCssObj,
						})
					);
					if (cssType === 'text') {
						$(`#${datePoint}`).text(val);
					} else {
						$(`#${datePoint}`).css(cssType, val);
					}
				});
			});
		};

		// 生成取消画线按钮
		this.cancelDrawLine = () => {
			$('#lineCancelBtn').show();
			// 取消画线事件绑定
			$('#lineCancelBtn').on('click', this.cancelBind);
		};

		// 取消画线事件绑定
		this.cancelBind = () => {
			// 删除按钮初始化
			if ($('#cancelBtn').hasClass('cancelDelete')) {
				$('#cancelBtn')
					.removeClass('cancelDelete')
					.text('删除');
				$('.createdElement')
					.unbind('click')
					.css('cursor', 'pointer');
				$('.lineConatiner')
					.unbind('click')
					.css('cursor', 'pointer');
			}
			$('body').unbind('click');
			$('body').unbind('mousemove');
			$('#lineCancelBtn').hide();
		};

		// 处理线的点击事件函数
		this.handleLineClick = e => {
			this.lineDatePoint = new Date().getTime();
			this.lineObj.x1 = e.clientX;
			this.lineObj.y1 = e.clientY;
			// 加入线容器
			const lineContainer = `<div class="lineConatiner" id="lineConatiner${this.lineDatePoint}"></div>`;
			$('body').append(lineContainer);
			// 画出初始点
			drawDot(this.lineDatePoint, this.lineObj.x1, this.lineObj.y1, '#000');
			$('body').unbind('click');
			// 鼠标移动重新渲染线
			$('body').bind('mousemove', e => {
				this.lineObj.x2 = e.clientX;
				this.lineObj.y2 = e.clientY;
				$(`#lineConatiner${this.lineDatePoint} .line${this.lineDatePoint}`)
					.siblings(0)
					.remove();
				drawLine(this.lineDatePoint, this.lineObj.x1, this.lineObj.y1, this.lineObj.x2, this.lineObj.y2, '#000');
			});
			// 重新绑定点击事件，画终点
			$('body').bind('click', e => {
				$('body').unbind('mousemove');
				this.lineObj.x2 = e.clientX;
				this.lineObj.y2 = e.clientY;
				drawLine(this.lineDatePoint, this.lineObj.x1, this.lineObj.y1, this.lineObj.x2, this.lineObj.y2, '#000');
				$('body').unbind('click');
				// 绑定下一次起点点击事件
				$('body').bind('click', this.handleLineClick);
			});
		};
	}

	/**
	 * @功能描述: 初始化事件构造函数
	 * @参数:无
	 * @返回值:无
	 */
	function InitialCom() {
		this.ls = window.localStorage;
		// 元素列表(注:initialStyle中不可有空格)
		this.myElementsList = [
			{
				name: 'div',
				content: '我是内容',
				type: 'div',
				initialStyle:
					'position:fixed;left:50%;top:50%;width:100px;height:100px;background:#0189fb;z-index:100;cursor:pointer;',
			},
			{
				name: 'button',
				content: 'button',
				type: 'button',
				initialStyle:
					'position:fixed;left:50%;top:50%;width:70px;height:25px;background:#fff;border-radius:10px;z-index:100;cursor:pointer;',
			},
			// line中的长宽属性无效
			{
				name: 'line',
				content: '',
				type: 'line',
				initialStyle: 'position:fixed;left:50%;top:50%;background:#000;z-index:100',
			},
		];

		// 侧边栏div
		this.siderBarHtml = `
			<div id="siderBar">
				<div class="tabsBtnWrap">
					<div class="tabsBtn">元素</div>
					<div class="tabsBtn">属性</div>
				</div>
				<div class="siderBarUlWrap">
					<ul class="siderBarUl">
						<div class="funcBtnWrap">
							<div id="downloadBtn" class="downloadBtn">下载</div>
							<div id="cancelBtn" class="cancelBtn">删除</div>
							<div id="lineCancelBtn" class="cancelBtn">点击取消画线</div>
						</div>
					</ul>
					<ul class="infoUl">
						<div class="emptyBox">
							当前属性为空，请先新建实例元素，再双击选择添加属性!
						</div>
						<div class="addInfoBtn">+</div>
					</ul>
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
			// 插入list元素
			this.appendList();
			// 插入收缩弹出按钮
			this.appendCollapseBtn();
			// 导入CSS
			this.importCss();
			// 初始关闭状态
			this.toggleCollapse();
		};

		/**
		 * @功能描述:点击下载按钮
		 * @参数:
		 * @返回值:
		 */
		this.downloadBtnclick = () => {
			const datePoint = longDateFormate(new Date());
			const contentObj = this.ls.getItem('siderBarCssObj') ? JSON.parse(this.ls.getItem('siderBarCssObj')) : '';
			const transContentObj = Object.keys(contentObj).map((item, idx) => {
				const cssName = `createdAt:${shortDateFormate(new Date(JSON.parse(item)))},itemOrder:${idx + 1}`;
				const cssContent = jsonToCss(contentObj[item]);
				return {
					[cssName]: cssContent,
				};
			});
			const content = JSON.stringify(transContentObj);
			const fileName = `${datePoint}下载的的样式`;
			this.createHref(fileName, content);
		};

		/**
		 * @功能描述:  创建下载文件的链接
		 * @参数: fileName(string) 文件名 content(string)文件内容
		 * @返回值:
		 */
		this.createHref = (fileName, content) => {
			// 创建a标签
			const aTag = document.createElement('a');
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
		 * @功能描述:点击删除按钮
		 * @参数:
		 * @返回值:
		 */
		this.deleteBtnclick = _this => {
			$(_this)
				.addClass('cancelDelete')
				.text('退出删除');
			$('.createdElement')
				.bind('click', function() {
					$(this).remove();
				})
				.css('cursor', 'crosshair');
			$('.lineConatiner')
				.bind('click', function() {
					$(this).remove();
				})
				.css('cursor', 'crosshair');
		};

		/**
		 * @功能描述:点击退出删除按钮
		 * @参数:
		 * @返回值:
		 */
		this.cancelBtnClick = _this => {
			$(_this)
				.removeClass('cancelDelete')
				.text('删除');
			$('.createdElement')
				.unbind('click')
				.css('cursor', 'pointer');
			$('.lineConatiner')
				.unbind('click')
				.css('cursor', 'pointer');
		};

		/**
		 * @功能描述:切换Tabs
		 * @参数: index(number)
		 * @返回值:
		 */
		this.tabsSwitchIndex = index => {
			$('.siderBarUlWrap ul')
				.eq(index)
				.show()
				.siblings(index)
				.hide();
		};

		// 插入list元素
		this.appendList = () => {
			this.myElementsList.map(({ name, initialStyle, type, content }) => {
				let element = `<li class="elementListLi" type=${type} content=${content} initialStyle=${initialStyle}>${name}</li>`;
				$('#siderBar .siderBarUl').append(element);
			});
		};

		// 点击收缩按钮事件
		this.toggleCollapse = () => {
			// 若已经折叠，则打开
			if ($('.collapseBtn').hasClass('collapsed')) {
				$('.collapseBtn').removeClass('collapsed');
				$('.collapseBtn').text('<');
				$('#siderBar').css({ left: '0px', 'min-height': '200px', height: 'auto' });
				$('.tabsBtnWrap').show();
				$('.siderBarUlWrap').show();
			} else {
				// 若未折叠，则折叠
				$('.collapseBtn').addClass('collapsed');
				$('.collapseBtn').text('>');
				$('#siderBar').css({ left: '-184px', 'min-height': 'unset', height: '40px' });
				$('.tabsBtnWrap').hide();
				$('.siderBarUlWrap').hide();
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
			.siderBarUlWrap{display:flex;}
			#lineCancelBtn{display:none;z-index:10;position: absolute;width: 90%;}
			.funcBtnWrap{display:flex;position: absolute;bottom: 8px;width: 88%;justify-content:space-between;}
		  .elementListLi:hover{box-shadow: 0px 0px 10px #0189fb;border: 1px solid #0189fb;}
			.collapseBtn{width: 20px;height: 20px;transform: translate(0px, 10px);background: rgba(255,255,255,0.6);text-align: center;border-radius: 10px;color: #333;font-weight: bold;line-height: 20px;cursor: pointer;position: absolute;right: 2px;top: 25%;}
			.siderBarUl{width: 100%;padding: 0;display: flex;flex-direction: column;}
			.detailLi{display:flex;margin-bottom: 10px;border-bottom: 1px solid #eee;padding: 10px 0 5px 0;width: 90%;}
			.detailLi input{width: 100%;}
			.detailLi span{margin-right: 5px;color:#fff;text-align: right;white-space: nowrap;}
			.collapsed{top: 50%;transform: translate(0px, -50%);right:8px;}
			.cancelBtn,.downloadBtn{flex:1;border-radius: 5px;font-size: 14px;background: #fff;text-align: center;height: 30px;line-height: 30px;margin: 0px 4px;cursor:pointer;}
			.cancelBtn:hover,.downloadBtn:hover{box-shadow: 0px 0px 10px #0189fb;}
			.emptyBox{color:#fff;margin-top: 20px;}
			.addInfoBtn{width: 50px;height: 20px;position: absolute;bottom: 6px;left: 50%;font-size: 20px;transform: translate(-50%, 0px);color: #fff;line-height: 20px;border-radius: 5px;background: #0189fb;;text-align: center;cursor:pointer;}
			.infoUl{width: 100%;padding: 0 10px;display: flex;flex-direction: column;display:none;padding-bottom: 20px;}
			.elementListLi{width: 90%;background: #fff;list-style: none;height: 20px;line-height: 20px;padding-left: 10px;border-radius: 5px;margin-bottom: 10px;border: 0;cursor:pointer;border: 1px solid #fff;}
			.tabsBtnWrap{display: flex;width: 96%;margin-bottom: 10px;justify-content: space-between;}
			.tabsBtn{border: 1px solid #fff;text-align:center;width:48%;}
			.tabsBtn:hover{box-shadow: 0px 0px 10px #0189fb;border: 1px solid #0189fb;}
			.tabsBtn{flex: 1;background: #fff;margin-right: 5px;border-radius: 5px 5px 0 0;cursor:pointer;}
			#siderBar{overflow: hidden;flex-direction: column;z-index:1000;background: rgba(0,0,0,0.3);position: fixed;left: 0;top: 10%;width: 200px;min-height: 200px;border-radius: 0 5px 5px 0;padding: 10px;display:flex;transition:all 0.3s ease}`;
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
