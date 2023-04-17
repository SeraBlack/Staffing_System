import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Space } from "antd";
import * as echarts from "echarts";
// import styled from "styled-components";
import * as mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf"; // 处理地理数据的js库
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";
import Pdata from '../../mock/pdata'
import moment from "moment";
let option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function (params) {
      return params[0].name + `<br/>上班时间：${params[0].data[1]}<br/>下班时间：${params[0].data[2]}`
    }
  },
  xAxis: {
    show: true,
    type: "category",
    data: []
  }
  ,
  yAxis: {
    show: true,
    type: "time",
    splitNumber: 15,
    axisLabel: {
      formatter: function (value) {
        return moment(value).format("kk:mm:ss")
      }
    }
  },
  series: [
    {
      type: 'candlestick',
      data: []
    }
  ]
};
export default function Index() {
  let myChart;

  const marker1 = useRef()
  const map = useRef()

  const [lngValue, setLngValue] = useState('116.34663062322568');
  const [latValue, setLatValue] = useState('40.10471411048371');
  const [startTime, setstartTime] = useState('08:00:00');
  const [endTime, setendTime] = useState('22:00:00');
  const [RadiusValue, setRadiusValue] = useState('500');

  //点击预览变更的中心点和经纬度
  function preview() {
    console.log("map.current,", map.current)
    // 中心点，109行定义的
    const center = [lngValue, latValue];
    // 半径，单位是千米，这里是500米
    const radius = RadiusValue / 1000;
    const options = {
      // 输入越大越像圆，一般选取32，不然会影响性能
      steps: 32,
      units: "kilometers",
      properties: { foo: "bar" },
    };

    // 用导入的turf地理空间处理的js库，在地图上画了个圆
    const circle = turf.circle(center, radius, options);

    const sourceObject = map.current.getSource("circle-data"); // 获取一下画的那个圆的数据

    // data拿到了之前的geojson中的feature
    const data = { ...sourceObject._data };

    data.features[0] = circle
    sourceObject.setData(data)

    map.current.flyTo({ center, zoom: 14 });
    marker1.current.remove();
    marker1.current = new mapboxgl.Marker().setLngLat(center).addTo(map.current);

  }

  //点击变更条状图条件
  const handleHit = () => {
    myChart = echarts.init(document.getElementById("mainForm"));
    const tody = moment().format('YYYY-MM-DD')
    // const up = tody + ' 08:00:00'
    const up = tody + ` ${startTime}`
    // const down = tody + ' 22:00:00'
    const down = tody + ` ${endTime}`
    option.series[0].data.forEach(item=>{
      item.splice(2,2,up,down)
    })
    console.log(option.series[0].data)
    Pdata.forEach((item) => {
      // option.series[0].data.push([item.startTime, item.endTime, up, down])
      // option.xAxis.data.push(item.name)
      // console.dir(startTime);
    })
    myChart.setOption(option);
  };

  useEffect(() => {
    if (!map.current) {
      myChart = echarts.init(document.getElementById("mainForm"));
      option.series[0].data = []
      const tody = moment().format('YYYY-MM-DD')
      // const up = tody + ' 08:00:00'
      const up = tody + ` ${startTime}`
      // const down = tody + ' 22:00:00'
      const down = tody + ` ${endTime}`

      Pdata.forEach((item) => {
        option.series[0].data.push([item.startTime, item.endTime, up, down])
        option.xAxis.data.push(item.name)
        console.dir(startTime);
      })
      myChart.setOption(option);

      //选取一个需要打卡的经纬度
      const monument = [lngValue, latValue];
      //在官网注册后可获得一个Token
      mapboxgl.accessToken =
        "pk.eyJ1IjoiYTk2NDMwNTkyNyIsImEiOiJjbDNzMWpwOTQxaWE0M2Rwbm1naHFhc3gzIn0.Z3mXHNQqT3YUbIhhGJCSLA";

      // 创建一个地图

      map.current = new mapboxgl.Map({
        // container ID，找一个id为map的div
        container: "map",
        // style URL，一些地图样式的id，以后会有各种好看的地图样式
        style: "mapbox://styles/mapbox/streets-v12",
        // lng,longitude,经度
        // starting position [lng, lat]，地图的中心点
        center: monument,
        // starting zoom，放大比例，一般放到10-15之间
        zoom: 14,
        doubleClickZoom: false
      });

      function getCenterValue(e) {
        console.log(e.lngLat);
        const { lng, lat } = e.lngLat

        setLngValue(lng);
        setLatValue(lat);
        // useRadiusValue(RadiusValue)
      };

      map.current.on('dblclick', getCenterValue);

      // #region
      //     // create the popup
      //    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
      //     'Construction on the Washington Monument began in 1848.'
      //     );

      //     // create DOM element for the marker
      //     const el = document.createElement('div');
      //     // el.id = 'marker';
      //     el.style.width = "10px"
      //     el.style.height = "10px"
      //     el.style.background = "#fff000"

      //     // create the marker
      //     new mapboxgl.Marker(el)
      //     .setLngLat(monument)
      //     .setPopup(popup) // sets a popup on this marker
      //     .addTo(map.current);

      // #endregion

      // marker是那个水滴，那个标记，这是默认的
      marker1.current = new mapboxgl.Marker().setLngLat(monument).addTo(map.current);

      // 中心点，109行定义的
      const center = monument;
      // 半径，单位是千米，这里是500米
      const radius = 0.5;
      const options = {
        // 输入越大越像圆，一般选取32，不然会影响性能
        steps: 32,
        units: "kilometers",
        properties: { foo: "bar" },
      };

      // 用导入的turf地理空间处理的js库，在地图上画了个圆
      const circle = turf.circle(center, radius, options);

      // 相当于js里面的window load
      map.current.on("load", () => {
        // 添加数据，将画好的圆传入（174行）
        map.current.addSource("circle-data", {
          // geojson是公认的地理数据格式
          type: "geojson",
          data: {
            //
            type: "FeatureCollection",
            features: [circle],
          },
        });

        // 添加图层
        map.current.addLayer({
          // 图层名字，后期方便查找
          id: "circles-layer",
          // 填充它
          type: "fill",
          // 绘制什么样的数据（169行起的名字）
          source: "circle-data",
          paint: {
            // 绘制颜色
            "fill-color": "#605dff",
            // 绘制透明度
            "fill-opacity": 0.5,
          },
        });

        // 为图层添加了框
        map.current.addLayer({
          id: "line-layer",
          type: "line",
          source: "circle-data",
          paint: {
            "line-color": "#000000",
            "line-width": 2,
          },
        });

        // // 是否显示那个框，改数据的时候会用到
        // map.current.setLayoutProperty("line-layer", "visibility", "none");

        // // 如果要修改数据
        // const sourceObject = map.current.getSource("circle-data"); // 获取一下画的那个圆的数据

        // // data拿到了之前的geojson中的feature
        // const data = { ...sourceObject._data };

        // // 半径设置为一千米
        // const radius2 = 1;

        // // 重写一个数据（只变了半径，中心点和画圆的参数没变）
        // const circle2 = turf.circle(center, radius2, options);

        // // 将新写好的数据覆盖features的第0个原来的数据（也只有第0个）
        // data.features[0] = circle2;

        // // 把重写好的data重新给回sourceObject，最终的效果是改大了半径
        // sourceObject.setData(data);
      });
    }

  }, []);



  // 计算工时
  const computedWorkTime = (a, b) => {
    const startTime = new Date(a); // 将上班时间转化为Date对象
    const endTime = new Date(b); // 将下班时间转化为Date对象
    const workHours = (endTime - startTime) / (1000 * 60 * 60); // 计算工作时长，单位为小时
    return workHours
  }



  return (
    <div id="box">
      <div className="container-scroller">

        <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
          <div className="navbar-brand-wrapper d-flex justify-content-center">
            <div className="navbar-brand-inner-wrapper d-flex justify-content-between align-items-center w-100">
              <a className="navbar-brand brand-logo" href="Home"><img src="https://majestic.bootmb.com/images/logo.svg" alt="logo" /></a>
              <a className="navbar-brand brand-logo-mini" href="Home"><img src="https://majestic.bootmb.com/images/logo-mini.svg" alt="logo" /></a>
              <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
                <span className="mdi mdi-sort-variant"></span>
              </button>
            </div>
          </div>
          <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
            <ul className="navbar-nav mr-lg-4 w-100">
              <li className="nav-item nav-search d-none d-lg-block w-100">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="search">
                      <i className="mdi mdi-magnify"></i>
                    </span>
                  </div>
                  <input type="text" className="form-control" placeholder="Search now" aria-label="search" aria-describedby="search" />
                </div>
              </li>
            </ul>
            <ul className="navbar-nav navbar-nav-right">
              <li className="nav-item dropdown mr-1">
                <a className="nav-link count-indicator dropdown-toggle d-flex justify-content-center align-items-center" id="messageDropdown" href="#" data-toggle="dropdown">
                  <i className="mdi mdi-message-text mx-0"></i>
                  <span className="count"></span>
                </a>
                <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="messageDropdown">
                  <p className="mb-0 font-weight-normal float-left dropdown-header">Messages</p>
                  <a className="dropdown-item">
                    <div className="item-thumbnail">
                      <img src="https://majestic.bootmb.com/images/faces/face4.jpg" alt="image" className="profile-pic" />
                    </div>
                    <div className="item-content flex-grow">
                      <h6 className="ellipsis font-weight-normal">David Grey
                      </h6>
                      <p className="font-weight-light small-text text-muted mb-0">
                        The meeting is cancelled
                      </p>
                    </div>
                  </a>
                  <a className="dropdown-item">
                    <div className="item-thumbnail">
                      <img src="https://majestic.bootmb.com/images/faces/face2.jpg" alt="image" className="profile-pic" />
                    </div>
                    <div className="item-content flex-grow">
                      <h6 className="ellipsis font-weight-normal">Tim Cook
                      </h6>
                      <p className="font-weight-light small-text text-muted mb-0">
                        New product launch
                      </p>
                    </div>
                  </a>
                  <a className="dropdown-item">
                    <div className="item-thumbnail">
                      <img src="https://majestic.bootmb.com/images/faces/face3.jpg" alt="image" className="profile-pic" />
                    </div>
                    <div className="item-content flex-grow">
                      <h6 className="ellipsis font-weight-normal"> Johnson
                      </h6>
                      <p className="font-weight-light small-text text-muted mb-0">
                        Upcoming board meeting
                      </p>
                    </div>
                  </a>
                </div>
              </li>
              <li className="nav-item dropdown mr-4">
                <a className="nav-link count-indicator dropdown-toggle d-flex align-items-center justify-content-center notification-dropdown" id="notificationDropdown" href="#" data-toggle="dropdown">
                  <i className="mdi mdi-bell mx-0"></i>
                  <span className="count"></span>
                </a>
                <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="notificationDropdown">
                  <p className="mb-0 font-weight-normal float-left dropdown-header">Notifications</p>
                  <a className="dropdown-item">
                    <div className="item-thumbnail">
                      <div className="item-icon bg-success">
                        <i className="mdi mdi-information mx-0"></i>
                      </div>
                    </div>
                    <div className="item-content">
                      <h6 className="font-weight-normal">Application Error</h6>
                      <p className="font-weight-light small-text mb-0 text-muted">
                        Just now
                      </p>
                    </div>
                  </a>
                  <a className="dropdown-item">
                    <div className="item-thumbnail">
                      <div className="item-icon bg-warning">
                        <i className="mdi mdi-settings mx-0"></i>
                      </div>
                    </div>
                    <div className="item-content">
                      <h6 className="font-weight-normal">Settings</h6>
                      <p className="font-weight-light small-text mb-0 text-muted">
                        Private message
                      </p>
                    </div>
                  </a>
                  <a className="dropdown-item">
                    <div className="item-thumbnail">
                      <div className="item-icon bg-info">
                        <i className="mdi mdi-account-box mx-0"></i>
                      </div>
                    </div>
                    <div className="item-content">
                      <h6 className="font-weight-normal">New user registration</h6>
                      <p className="font-weight-light small-text mb-0 text-muted">
                        2 days ago
                      </p>
                    </div>
                  </a>
                </div>
              </li>
              <li className="nav-item nav-profile dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown">
                  <img src="https://majestic.bootmb.com/images/faces/face5.jpg" alt="profile" />
                  <span className="nav-profile-name">Louis Barnett</span>
                </a>
                <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
                  <a className="dropdown-item">
                    <i className="mdi mdi-settings text-primary"></i>
                    Settings
                  </a>
                  <a className="dropdown-item">
                    <i className="mdi mdi-logout text-primary"></i>
                    Logout
                  </a>
                </div>
              </li>
            </ul>
            <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
              <span className="mdi mdi-menu"></span>
            </button>
          </div>
        </nav>

        <div className="container-fluid page-body-wrapper">

          <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">
              <li className="nav-item">
                <a className="nav-link" href="Home">
                  <i className="mdi mdi-home menu-icon"></i>
                  <span className="menu-title">Dashboard</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
                  <i className="mdi mdi-circle-outline menu-icon"></i>
                  <span className="menu-title">UI Elements</span>
                  <i className="menu-arrow"></i>
                </a>
                <div className="collapse" id="ui-basic">
                  <ul className="nav flex-column sub-menu">
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/ui-features/buttons.html">Buttons</a></li>
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/ui-features/typography.html">Typography</a></li>
                  </ul>
                </div>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://majestic.bootmb.com/pages/forms/basic_elements.html">
                  <i className="mdi mdi-view-headline menu-icon"></i>
                  <span className="menu-title">Form elements</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://majestic.bootmb.com/pages/charts/chartjs.html">
                  <i className="mdi mdi-chart-pie menu-icon"></i>
                  <span className="menu-title">Charts</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://majestic.bootmb.com/pages/tables/basic-table.html">
                  <i className="mdi mdi-grid-large menu-icon"></i>
                  <span className="menu-title">Tables</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://majestic.bootmb.com/pages/icons/mdi.html">
                  <i className="mdi mdi-emoticon menu-icon"></i>
                  <span className="menu-title">Icons</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-toggle="collapse" href="#auth" aria-expanded="false" aria-controls="auth">
                  <i className="mdi mdi-account menu-icon"></i>
                  <span className="menu-title">User Pages</span>
                  <i className="menu-arrow"></i>
                </a>
                <div className="collapse" id="auth">
                  <ul className="nav flex-column sub-menu">
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/samples/login.html"> Login </a></li>
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/samples/login-2.html"> Login 2 </a></li>
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/samples/register.html"> Register </a></li>
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/samples/register-2.html"> Register 2 </a></li>
                    <li className="nav-item"> <a className="nav-link" href="https://majestic.bootmb.com/pages/samples/lock-screen.html"> Lockscreen </a></li>
                  </ul>
                </div>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="documentation/documentation.html">
                  <i className="mdi mdi-file-document-box-outline menu-icon"></i>
                  <span className="menu-title">Documentation</span>
                </a>
              </li>
            </ul>
          </nav>

          <div className="main-panel">
            <div className="content-wrapper">

              <div className="row">
                <div className="col-md-12 grid-margin">
                  <div className="d-flex justify-content-between flex-wrap">
                    <div className="d-flex align-items-end flex-wrap">
                      <div className="mr-md-3 mr-xl-5">
                        <h2>Welcome back,</h2>
                        <p className="mb-md-0">Your analytics dashboard template.</p>
                      </div>
                      <div className="d-flex">
                        <i className="mdi mdi-home text-muted hover-cursor"></i>
                        <p className="text-muted mb-0 hover-cursor">&nbsp;/&nbsp;Dashboard&nbsp;/&nbsp;</p>
                        <p className="text-primary mb-0 hover-cursor">Analytics</p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-end flex-wrap">
                      <button type="button" className="btn btn-light bg-white btn-icon mr-3 d-none d-md-block ">
                        <i className="mdi mdi-download text-muted"></i>
                      </button>
                      <button type="button" className="btn btn-light bg-white btn-icon mr-3 mt-2 mt-xl-0">
                        <i className="mdi mdi-clock-outline text-muted"></i>
                      </button>
                      <button type="button" className="btn btn-light bg-white btn-icon mr-3 mt-2 mt-xl-0">
                        <i className="mdi mdi-plus text-muted"></i>
                      </button>
                      <button className="btn btn-primary mt-2 mt-xl-0">Generate report</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 grid-margin stretch-card">
                  <div className="card">
                    <div className="card-body dashboard-tabs p-0">
                      <ul className="nav nav-tabs px-4" role="tablist">
                        <li className="nav-item">
                          <a className="nav-link active" id="overview-tab" data-toggle="tab" href="#overview" role="tab" aria-controls="overview" aria-selected="true">Overview</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" id="sales-tab" data-toggle="tab" href="#sales" role="tab" aria-controls="sales" aria-selected="false">Sales</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" id="purchases-tab" data-toggle="tab" href="#purchases" role="tab" aria-controls="purchases" aria-selected="false">Purchases</a>
                        </li>
                      </ul>
                      <div className="tab-content py-0 px-0">
                        <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                          <div className="d-flex flex-wrap justify-content-xl-between">
                            <div className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-calendar-heart icon-lg mr-3 text-primary"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Start date</small>
                                <div className="dropdown">
                                  <a className="btn btn-secondary dropdown-toggle p-0 bg-transparent border-0 text-dark shadow-none font-weight-medium" href="#" role="button" id="dropdownMenuLinkA" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <h5 className="mb-0 d-inline-block">26 Jul 2018</h5>
                                  </a>
                                  <div className="dropdown-menu" aria-labelledby="dropdownMenuLinkA">
                                    <a className="dropdown-item" href="#">12 Aug 2018</a>
                                    <a className="dropdown-item" href="#">22 Sep 2018</a>
                                    <a className="dropdown-item" href="#">21 Oct 2018</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-currency-usd mr-3 icon-lg text-danger"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Revenue</small>
                                <h5 className="mr-2 mb-0">$577545</h5>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-eye mr-3 icon-lg text-success"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Total views</small>
                                <h5 className="mr-2 mb-0">9833550</h5>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-download mr-3 icon-lg text-warning"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Downloads</small>
                                <h5 className="mr-2 mb-0">2233783</h5>
                              </div>
                            </div>
                            <div className="d-flex py-3 border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-flag mr-3 icon-lg text-danger"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Flagged</small>
                                <h5 className="mr-2 mb-0">3497843</h5>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="tab-pane fade" id="sales" role="tabpanel" aria-labelledby="sales-tab">
                          <div className="d-flex flex-wrap justify-content-xl-between">
                            <div className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-calendar-heart icon-lg mr-3 text-primary"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Start date</small>
                                <div className="dropdown">
                                  <a className="btn btn-secondary dropdown-toggle p-0 bg-transparent border-0 text-dark shadow-none font-weight-medium" href="#" role="button" id="dropdownMenuLinkA" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <h5 className="mb-0 d-inline-block">26 Jul 2018</h5>
                                  </a>
                                  <div className="dropdown-menu" aria-labelledby="dropdownMenuLinkA">
                                    <a className="dropdown-item" href="#">12 Aug 2018</a>
                                    <a className="dropdown-item" href="#">22 Sep 2018</a>
                                    <a className="dropdown-item" href="#">21 Oct 2018</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-download mr-3 icon-lg text-warning"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Downloads</small>
                                <h5 className="mr-2 mb-0">2233783</h5>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-eye mr-3 icon-lg text-success"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Total views</small>
                                <h5 className="mr-2 mb-0">9833550</h5>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-currency-usd mr-3 icon-lg text-danger"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Revenue</small>
                                <h5 className="mr-2 mb-0">$577545</h5>
                              </div>
                            </div>
                            <div className="d-flex py-3 border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-flag mr-3 icon-lg text-danger"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Flagged</small>
                                <h5 className="mr-2 mb-0">3497843</h5>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="tab-pane fade" id="purchases" role="tabpanel" aria-labelledby="purchases-tab">
                          <div className="d-flex flex-wrap justify-content-xl-between">
                            <div className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-calendar-heart icon-lg mr-3 text-primary"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Start date</small>
                                <div className="dropdown">
                                  <a className="btn btn-secondary dropdown-toggle p-0 bg-transparent border-0 text-dark shadow-none font-weight-medium" href="#" role="button" id="dropdownMenuLinkA" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <h5 className="mb-0 d-inline-block">26 Jul 2018</h5>
                                  </a>
                                  <div className="dropdown-menu" aria-labelledby="dropdownMenuLinkA">
                                    <a className="dropdown-item" href="#">12 Aug 2018</a>
                                    <a className="dropdown-item" href="#">22 Sep 2018</a>
                                    <a className="dropdown-item" href="#">21 Oct 2018</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-currency-usd mr-3 icon-lg text-danger"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Revenue</small>
                                <h5 className="mr-2 mb-0">$577545</h5>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-eye mr-3 icon-lg text-success"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Total views</small>
                                <h5 className="mr-2 mb-0">9833550</h5>
                              </div>
                            </div>
                            <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-download mr-3 icon-lg text-warning"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Downloads</small>
                                <h5 className="mr-2 mb-0">2233783</h5>
                              </div>
                            </div>
                            <div className="d-flex py-3 border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                              <i className="mdi mdi-flag mr-3 icon-lg text-danger"></i>
                              <div className="d-flex flex-column justify-content-around">
                                <small className="mb-1 text-muted">Flagged</small>
                                <h5 className="mr-2 mb-0">3497843</h5>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                {/* <!-- zheli --> */}
                <div id="top1">
                  <div className="rig">
                    <div id="mainForm" ></div>
                    <div className="IBElm">
                      <Input style={{ width: 200, marginRight: 10 }} placeholder="经度" value={startTime} onChange={(e) => { setstartTime(e.target.value) }}></Input>
                      <Input style={{ width: 200, marginRight: 10 }} placeholder="纬度" value={endTime} onChange={(e) => { setendTime(e.target.value) }}></Input>
                      {/* <Input style={{ width: 150, marginRight: 10 }} placeholder="签到范围" value={RadiusValue} onChange={(e) => { setRadiusValue(e.target.value) }}></Input> */}
                      <Space wrap>
                        <Button type="primary" onClick={handleHit}>预览</Button>
                        <Button type="primary">应用中心点及签到范围</Button>
                      </Space>
                    </div>
                  </div>


                  <div>
                    {/* 这是地图组件 */}
                    <div className="IBElm">
                      <Input style={{ width: 150, marginRight: 10 }} placeholder="经度" value={lngValue} onChange={(e) => { setLngValue(e.target.value) }}></Input>
                      <Input style={{ width: 150, marginRight: 10 }} placeholder="纬度" value={latValue} onChange={(e) => { setLatValue(e.target.value) }}></Input>
                      <Input style={{ width: 150, marginRight: 10 }} placeholder="签到范围" value={RadiusValue} onChange={(e) => { setRadiusValue(e.target.value) }}></Input>
                      <Space wrap>
                        <Button type="primary" onClick={preview}>预览</Button>
                        <Button type="primary">应用中心点及签到范围</Button>
                      </Space>
                    </div>

                    <div id="map"></div></div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 stretch-card">
                  <div className="card">
                    <div className="card-body">
                      <p className="card-title">打卡详细列表</p>
                      <div className="table-responsive">
                        <table id="recent-purchases-listing" className="table">
                          <thead>
                            <tr>
                              <th>工号</th>
                              <th>姓名</th>
                              <th>打卡地点</th>
                              <th>上班打卡时间</th>
                              <th>下班打卡时间</th>
                              <th>工作时长</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* <tr> */}
                            {Pdata.map(item => (
                              <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.location}</td>
                                <td>{item.startTime}</td>
                                <td>{item.endTime}</td>
                                <td>{computedWorkTime(item.startTime, item.endTime).toFixed(2)}</td>
                              </tr>)
                            )
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="footer">
              <div className="d-sm-flex justify-content-center justify-content-sm-between">
                <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">本毕设利用Bootstrap开发</span>
                <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center"> 官网 <a href="https://www.bootstrapdash.com/" target="_blank">bootstrapdash</a></span>
              </div>
            </footer>

          </div>

        </div>

      </div>




    </div>
  );
}
