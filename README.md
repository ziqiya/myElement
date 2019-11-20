<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 阮旭松
 * @Date: 2019-08-17 17:58:52
 * @LastEditors: 阮旭松
 * @LastEditTime: 2019-11-20 14:40:06
 -->

# python 自动生成器

油猴脚本-python 自动生成器

## 一、概要

其大致功能为从网站上获得对应的爬虫代码

## 二、注意

- 1.本脚本需要配合 爬虫生成器工具 打开，否则没有 hash
- 2.本脚本默认禁用所有 a 链接跳转，如果想取消禁用，请点击“允许跳转”按钮

## 三、使用方法

先下载油猴，将脚本添加到游猴

## 四、功能说明

### 1. 列表页-爬取列表

- 1.先在爬虫生成器工具的 url 框中输入要爬取的列表页面完整 url，点击跳转，在 iframe 中将进入目标页面。
- 2.点击右上角的 toggle 按钮弹出配置项工具，点击 cardItem 下的 firstSelect 右边的“请选择”，然后在列表页面中选择第一个 card，然后点击 lastSelect 右边的“请选择”，然后选择列表最后一个 card。
- 3.点击 cardInfo 下的链接(cardUrl)右边的“请选择”，然后选择其中一个 cardItem 的爬取链接。
- 4.点击“测试 cardList”按钮将发送列表的信息到后端，后端将返回爬取到的具体内容并弹窗显示。

### 2. 列表页-爬取分页器

- 1.选择 pageDom 右边的请选择，在页面中选择整个分页器元素
- 2.点击“测试 page”按钮将发送分页器的信息到后端，后端将返回爬取到的具体内容并弹窗显示。

### 3. 详情页-爬取详情页

- 1.先在爬虫生成器工具的 infoUrl 框中输入要爬取的详情页面完整 url，点击跳转，在 iframe 中将进入目标详情页面。
- 2.点击 pageInfo 下的加号按钮，在 pageInfo 的列表中将自动生成初始键值对选择项。
- 3.先在左侧输入框中输入需要爬取的字段名，再选择右边的请选择，然后在页面中选择对应元素。
- 4.点击“测试 pageInfo”按钮将把要爬取的详情页信息配置发送给后端，后端将返回爬取到的具体内容并弹窗显示。

### 4. 下载 Python

- 1.点击“下载 Python”按钮可以下载所有选择的 dom 元素的 python 并存在本地。

### 5. 清空 Python

- 1.点击“清空 Python”按钮可以清空所有选择的 dom 元素的 python。

### 6. 查看 Python

- 1.点击“查看 Python”按钮可以查看所有已选择的 dom 元素的 python。

### 7. 允许/禁用跳转

- 1.本脚本默认禁用所有 a 链接跳转，如果想取消禁用，请点击“允许跳转”按钮
- 2.再次点击“禁止跳转”按钮将禁用所有 a 链接跳转
