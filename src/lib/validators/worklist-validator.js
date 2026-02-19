"use strict";
export const validate = validate11;
export default validate11;
const schema12 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Worklist Items","description":"Task management list for flagged records requiring attention or review.","type":"object","items":{"type":"object","required":["source_table","source_id"],"properties":{"id":{"type":"integer","description":"Unique worklist item identifier."},"source_table":{"type":"string","enum":["invoice_items","systems","kpi_data"],"description":"Name of the table where the flagged record belongs."},"source_id":{"type":"integer","description":"Primary key ID of the record in the source table."},"display_label":{"type":"string","description":"Human-readable title or summary of the flagged item."},"display_context":{"type":"string","description":"Additional context (e.g., period, category) to help identify the item."},"added_at":{"type":"string","format":"date-time","description":"Timestamp when the item was added to the worklist."},"status":{"type":"string","enum":["open","in_progress","resolved","ignored"],"default":"open","description":"Current processing status of the worklist item."}}}};
const formats2 = require("ajv-formats/dist/formats").fullFormats["date-time"];

function validate11(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
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
data0.status = "open";
}
if(data0.source_table === undefined){
const err1 = {instancePath:instancePath+"/" + i0,schemaPath:"#/items/required",keyword:"required",params:{missingProperty: "source_table"},message:"must have required property '"+"source_table"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data0.source_id === undefined){
const err2 = {instancePath:instancePath+"/" + i0,schemaPath:"#/items/required",keyword:"required",params:{missingProperty: "source_id"},message:"must have required property '"+"source_id"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data0.id !== undefined){
let data1 = data0.id;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err3 = {instancePath:instancePath+"/" + i0+"/id",schemaPath:"#/items/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data0.source_table !== undefined){
let data2 = data0.source_table;
if(typeof data2 !== "string"){
const err4 = {instancePath:instancePath+"/" + i0+"/source_table",schemaPath:"#/items/properties/source_table/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!(((data2 === "invoice_items") || (data2 === "systems")) || (data2 === "kpi_data"))){
const err5 = {instancePath:instancePath+"/" + i0+"/source_table",schemaPath:"#/items/properties/source_table/enum",keyword:"enum",params:{allowedValues: schema12.items.properties.source_table.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data0.source_id !== undefined){
let data3 = data0.source_id;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err6 = {instancePath:instancePath+"/" + i0+"/source_id",schemaPath:"#/items/properties/source_id/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data0.display_label !== undefined){
if(typeof data0.display_label !== "string"){
const err7 = {instancePath:instancePath+"/" + i0+"/display_label",schemaPath:"#/items/properties/display_label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data0.display_context !== undefined){
if(typeof data0.display_context !== "string"){
const err8 = {instancePath:instancePath+"/" + i0+"/display_context",schemaPath:"#/items/properties/display_context/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data0.added_at !== undefined){
let data6 = data0.added_at;
if(typeof data6 === "string"){
if(!(formats2.validate(data6))){
const err9 = {instancePath:instancePath+"/" + i0+"/added_at",schemaPath:"#/items/properties/added_at/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/" + i0+"/added_at",schemaPath:"#/items/properties/added_at/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
let data7 = data0.status;
if(typeof data7 !== "string"){
const err11 = {instancePath:instancePath+"/" + i0+"/status",schemaPath:"#/items/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!((((data7 === "open") || (data7 === "in_progress")) || (data7 === "resolved")) || (data7 === "ignored"))){
const err12 = {instancePath:instancePath+"/" + i0+"/status",schemaPath:"#/items/properties/status/enum",keyword:"enum",params:{allowedValues: schema12.items.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
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
validate11.errors = vErrors;
return errors === 0;
}
