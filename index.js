/**
 * @fileoverview Description of file, its uses and information
 * about its dependencies.
 */

'use strict';

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud;

/**
 *
 * @type {*|exports|module.exports}
 */
var utils;

/**
 *
 * @type {*|exports|module.exports}
 */
var backboneEvents;

/**
 *
 */
var transformPoint;

/**
 *
 * @type {string}
 */
var exId = "tlexplorer";

/**
 *
 */
var clicktimer;


/**
 *
 */
var mapObj;

var storeEdj = new geocloud.sqlStore({
    jsonp: true,
    host: "https://gc2.io",
    db: "dk",
    clickable: true,
    styleMap: {
        weight: 5,
        color: '#660000',
        dashArray: '',
        fillOpacity: 0.2
    },
});

var storeMat = new geocloud.sqlStore({
    jsonp: true,
    host: "https://gc2.io",
    db: "dk",
    clickable: true
});


/**
 *
 * @type {{set: module.exports.set, init: module.exports.init}}
 */

module.exports = module.exports = {

    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        cloud = o.cloud;
        utils = o.utils;
        transformPoint = o.transformPoint;
        backboneEvents = o.backboneEvents;
        return this;
    },

    /**
     *
     */
    init: function () {

        mapObj = cloud.get().map;

        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');

        /**
         *
         */
        class TLexplorer extends React.Component {
            constructor(props) {
                super(props);

                this.state = {
                    active: false,
                    matTxt: "",
                    ejdTxt: "",
                    matArr: []
                };

                this.onActive = this.onActive.bind(this);
                this.onLookUp = this.onLookUp.bind(this);

            }

            onActive(e) {
                this.setState({
                    active: e.target.checked
                });

                console.log(e.target.checked);

                if (e.target.checked) {

                } else {

                }

            }

            onLookUp(e, m) {
                console.log(e)
                console.log(m)
                window.open("tlexpll://?m=" + e + "," + m);
            }

            componentDidMount() {
                var me = this;

                // Handle click events on map
                // ==========================

                mapObj.on("dblclick", function () {
                    clicktimer = undefined;
                });
                mapObj.on("click", function (e) {
                    var event = new geocloud.clickEvent(e, cloud);
                    if (clicktimer) {
                        clearTimeout(clicktimer);
                    }
                    else {
                        if (me.state.active === false) {
                            return;
                        }

                        clicktimer = setTimeout(function (e) {

                            clicktimer = undefined;

                            var coords = event.getCoordinate(), p;
                            p = utils.transform("EPSG:3857", "EPSG:4326", coords);

                            var sqlEjd = "SELECT * FROM matrikel.jordstykke WHERE esr_ejendomsnummer = (SELECT esr_ejendomsnummer FROM matrikel.jordstykke WHERE the_geom && ST_Transform(ST_Geomfromtext('POINT(" + p.x + " " + p.y + ")',4326),25832) AND ST_Intersects(the_geom, ST_Transform(ST_Geomfromtext('POINT(" + p.x + " " + p.y + ")',4326),25832)))";
                            var sqlMat = "SELECT * FROM matrikel.jordstykke WHERE the_geom && ST_Transform(ST_Geomfromtext('POINT(" + p.x + " " + p.y + ")',4326),25832) AND ST_Intersects(the_geom, ST_Transform(ST_Geomfromtext('POINT(" + p.x + " " + p.y + ")',4326),25832))";
                            storeEdj.reset();
                            storeMat.reset();
                            storeEdj.sql = sqlEjd;
                            storeMat.sql = sqlMat;
                            cloud.get().addGeoJsonStore(storeEdj);
                            storeEdj.load();
                            storeMat.load();
                            storeMat.onLoad = function () {
                                var properties = this.geoJSON.features[0].properties;
                                console.log(properties);
                                //me.onLookUp(properties.landsejerlavskode, properties.matrikelnummer)
                                me.setState({
                                    matTxt: "Matrikelnr.: " + properties.matrikelnummer + " " + properties.ejerlavsnavn
                                });
                            };

                            storeEdj.onLoad = function () {
                                var properties = this.geoJSON.features[0].properties;
                                console.log(properties);
                                //me.onLookUp(properties.landsejerlavskode, .properties.matrikelnummer)
                                me.setState({
                                    ejdTxt: "HEJ"
                                });
                                var arr = [];
                                this.geoJSON.features.map(function(f){
                                    arr.push( f.properties.matrikelnummer + " " + f.properties.ejerlavsnavn);
                                });

                                /*me.setState({
                                    ejdTxt: "HEJ",
                                    matArr: arr
                                });*/

                                var table = gc2table.init({
                                    el: "#gc2-ejd-table",
                                    geocloud2: cloud.get(),
                                    store: storeEdj,
                                    cm: [
                                        {
                                            header: "Matrikelnr.",
                                            dataIndex: "matrikelnummer",
                                            sortable: true
                                        },{
                                            header: "Ejerlav",
                                            dataIndex: "ejerlavsnavn",
                                            sortable: true
                                        }
                                    ],
                                    autoUpdate: false,
                                    autoPan: false,
                                    openPopUp: true,
                                    setViewOnSelect: true,
                                    responsive: false,
                                    callCustomOnload: false,
                                    height: 400,
                                    locale: window._vidiLocale.replace("_", "-")
                                });
                                table.loadDataInTable();


                            }
                        }, 250);
                    }
                });
            }

            render() {
                var matItems = this.state.matArr.map(function(name){
                    return <li key={name}>{name}</li>;
                });
                return (

                    <div role="tabpanel">
                        <div className="panel panel-default">
                            <div className="panel-body">
                                <div className="form-group">
                                    <div className="togglebutton">
                                        <label><input id="TLexplorer-btn" type="checkbox"
                                                      defaultChecked={ this.state.active } onChange={this.onActive}/>Aktiver</label>
                                    </div>

                                </div>
                                <div>{this.state.matTxt}</div>
                                <div>
                                    <ul>
                                        {matItems}
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div>
                );
            }
        }

        utils.createMainTab(exId, "TLexplorer", "Info", require('./../../height')().max);

        // Append to DOM
        //==============
        try {

            ReactDOM.render(
                <TLexplorer />,
                document.getElementById(exId)
            );
        } catch (e) {

        }

    },

    /**
     *
     */
    control: function () {
        if ($("#" + exId + "-btn").is(':checked')) {

            // Emit "on" event
            //================

            backboneEvents.get().trigger("on:" + exId);

            utils.cursorStyle().crosshair();

        } else {

            // Emit "off" event
            //=================

            backboneEvents.get().trigger("off:" + exId);

            utils.cursorStyle().reset();

        }
    },

    click: function (event) {
        var coords = event.getCoordinate(), p, url;
        p = utils.transform("EPSG:3857", "EPSG:4326", coords);


        utils.popupCenter(url, (utils.screen().width - 100), (utils.screen().height - 100), exId);
    },

    /**
     * Turns conflict off and resets DOM
     */
    off: function () {
        // Clean up
    }

};


