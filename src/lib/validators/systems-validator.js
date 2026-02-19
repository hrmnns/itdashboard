"use strict";
export const validate = validate10;
export default validate10;
const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Systems Inventory","description":"Registry of IT systems, applications, and services monitored by the dashboard.","type":"object","items":{"type":"object","required":["name"],"properties":{"id":{"type":"integer","description":"Unique system identifier (auto-increment)."},"name":{"type":"string","minLength":1,"description":"Name of the system or application."},"url":{"type":"string","format":"uri","description":"Link to the system's dashboard or login page."},"status":{"type":"string","enum":["online","offline","maintenance","degraded","unknown"],"default":"unknown","description":"Current operational status of the system."},"category":{"type":"string","description":"Classification group (e.g., 'ERP', 'CRM', 'Infrastructure')."},"is_favorite":{"type":"integer","enum":[0,1],"description":"Boolean flag (0/1) indicating if the system is pinned to dashboard."},"sort_order":{"type":"integer","description":"Display order in lists and tiles."}}}};
import ucs2length from "ajv/dist/runtime/ucs2length.js"; const func2 = ucs2length;
const formats0 = require("ajv-formats/dist/formats").fullFormats.uri;

function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(!(data && typeof data == "object" && !Array.isArray(data))){
const err0 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(Array.isArray(data)){
const len0 = data.length;
for(let i0=0; i0<len0; i0++){
let data0 = data[i0];
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
if(data0.status === undefined){
data0.status = "unknown";
}
if(data0.name === undefined){
const err1 = {instancePath:instancePath+"/" + i0,schemaPath:"#/items/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data0.id !== undefined){
let data1 = data0.id;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err2 = {instancePath:instancePath+"/" + i0+"/id",schemaPath:"#/items/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data0.name !== undefined){
let data2 = data0.name;
if(typeof data2 === "string"){
if(func2(data2) < 1){
const err3 = {instancePath:instancePath+"/" + i0+"/name",schemaPath:"#/items/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/" + i0+"/name",schemaPath:"#/items/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data0.url !== undefined){
let data3 = data0.url;
if(typeof data3 === "string"){
if(!(formats0(data3))){
const err5 = {instancePath:instancePath+"/" + i0+"/url",schemaPath:"#/items/properties/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/" + i0+"/url",schemaPath:"#/items/properties/url/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
let data4 = data0.status;
if(typeof data4 !== "string"){
const err7 = {instancePath:instancePath+"/" + i0+"/status",schemaPath:"#/items/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(!(((((data4 === "online") || (data4 === "offline")) || (data4 === "maintenance")) || (data4 === "degraded")) || (data4 === "unknown"))){
const err8 = {instancePath:instancePath+"/" + i0+"/status",schemaPath:"#/items/properties/status/enum",keyword:"enum",params:{allowedValues: schema11.items.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data0.category !== undefined){
if(typeof data0.category !== "string"){
const err9 = {instancePath:instancePath+"/" + i0+"/category",schemaPath:"#/items/properties/category/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data0.is_favorite !== undefined){
let data6 = data0.is_favorite;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
const err10 = {instancePath:instancePath+"/" + i0+"/is_favorite",schemaPath:"#/items/properties/is_favorite/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!((data6 === 0) || (data6 === 1))){
const err11 = {instancePath:instancePath+"/" + i0+"/is_favorite",schemaPath:"#/items/properties/is_favorite/enum",keyword:"enum",params:{allowedValues: schema11.items.properties.is_favorite.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data0.sort_order !== undefined){
let data7 = data0.sort_order;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
const err12 = {instancePath:instancePath+"/" + i0+"/sort_order",schemaPath:"#/items/properties/sort_order/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/" + i0,schemaPath:"#/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
validate10.errors = vErrors;
return errors === 0;
}
