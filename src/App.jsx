import React, { useState, useCallback, useMemo, useRef } from "react";
import Papa from "papaparse";
import _ from "lodash";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Line, LineChart, Legend } from "recharts";
import { Upload, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Shield, BarChart3, Activity, ChevronRight, X, Search, RefreshCw, Layers, Eye, Database, Brain, Wand2, FileText, ExternalLink, ChevronLeft, ChevronDown, Settings, GripVertical, Download, Plus, Trash2, Play } from "lucide-react";

var T={bg:"#0B0E11",sf:"#12161C",cd:"#171C24",bd:"#1E2530",bl:"#2A3344",tx:"#E8ECF1",tm:"#8494A7",td:"#566375",ac:"#00D4AA",ad:"rgba(0,212,170,0.12)",wn:"#FFB224",dg:"#FF4D6A",bu:"#4D9EFF",pu:"#A78BFA"};
var PL=["#00D4AA","#4D9EFF","#FFB224","#A78BFA","#FF4D6A","#36D7B7","#F472B6","#818CF8","#FBBF24","#34D399"];
var STD={loan_id:{l:"Loan ID",p:[/loan.?id/i,/account.?(id|num|no)/i,/^id$/i]},original_balance:{l:"Orig Bal",p:[/orig.?(bal|amount|principal)/i,/loan.?amount/i,/funded/i]},current_balance:{l:"Curr Bal",p:[/curr.?bal/i,/current.?(bal|amount)/i,/^upb$/i,/outstanding/i]},interest_rate:{l:"Rate",p:[/interest.?rate/i,/^rate$/i,/coupon/i,/^apr$/i]},original_term:{l:"Orig Term",p:[/orig.?term/i,/^term$/i,/loan.?term/i]},remaining_term:{l:"Rem Term",p:[/remain.?term/i,/rem.?term/i]},monthly_payment:{l:"Mo Pmt",p:[/monthly.?pay/i,/installment/i,/^pmt$/i]},fico_origination:{l:"FICO Orig",p:[/fico.?orig/i,/orig.?fico/i,/orig.?score/i]},fico_current:{l:"FICO Curr",p:[/fico.?curr/i,/curr.?fico/i,/fico$/i,/credit.?score$/i]},dti:{l:"DTI",p:[/^dti/i,/debt.?to.?income/i,/dti.?back/i]},loan_status:{l:"Status",p:[/loan.?status/i,/^status$/i]},dpd:{l:"DPD",p:[/days.?past/i,/^dpd$/i]},dpd_bucket:{l:"DPD Bucket",p:[/dpd.?bucket/i]},times_30dpd:{l:"30DPD Ct",p:[/times.?30/i]},times_60dpd:{l:"60DPD Ct",p:[/times.?60/i]},times_90dpd:{l:"90DPD Ct",p:[/times.?90/i]},origination_date:{l:"Orig Date",p:[/orig.?date/i,/origination/i,/issue.?date/i]},loan_purpose:{l:"Purpose",p:[/purpose/i]},state:{l:"State",p:[/state/i,/borrower.?state/i]},annual_income:{l:"Annual Inc",p:[/annual.?income/i,/gross.?income/i]},monthly_income:{l:"Mo Inc",p:[/monthly.?income/i]},employment_status:{l:"Empl",p:[/employ.?status/i]},employment_length:{l:"Empl Yrs",p:[/employ.?length/i]},grade:{l:"Grade",p:[/^grade$/i,/^sub.?grade$/i]},origination_channel:{l:"Channel",p:[/channel/i,/orig.?channel/i]},income_verification:{l:"Inc Verif",p:[/income.?verif/i,/verif.?status/i]},housing_status:{l:"Housing",p:[/housing/i,/home.?own/i]},open_accounts:{l:"Open Accts",p:[/open.?(acc|credit|lines)/i]},revolving_utilization:{l:"Rev Util",p:[/revolv.?util/i]},total_paid_principal:{l:"Princ Paid",p:[/total.?princ.?paid/i,/principal.?paid/i]},total_paid_interest:{l:"Int Paid",p:[/total.?int.?paid/i,/interest.?paid/i]},origination_fee:{l:"Orig Fee",p:[/orig.?fee/i]},late_fees:{l:"Late Fees",p:[/late.?fee/i]},recoveries:{l:"Recoveries",p:[/recover/i]},net_loss:{l:"Net Loss",p:[/net.?loss/i,/write.?off/i]},months_on_book:{l:"MOB",p:[/months.?on.?book/i,/loan.?age/i,/^mob$/i]},vintage:{l:"Vintage",p:[/vintage/i,/cohort/i,/orig.?year/i]},co_borrower:{l:"Co-Borr",p:[/co.?borrow/i,/joint/i]},hardship:{l:"Hardship",p:[/hardship/i,/forbear/i]},modification:{l:"Mod",p:[/modif/i,/tdr/i]},pd_score:{l:"PD",p:[/^pd/i,/prob.?default/i,/pd.?model/i]},lgd:{l:"LGD",p:[/^lgd/i,/loss.?given/i]},expected_loss:{l:"Exp Loss",p:[/expected.?loss/i,/^el$/i]},pool_id:{l:"Pool",p:[/pool/i,/trust/i]},servicer:{l:"Servicer",p:[/servicer/i]},investor:{l:"Investor",p:[/investor/i]},autopay:{l:"Autopay",p:[/auto.?pay/i]}};

function pn(v){if(v==null||v==="")return null;var n=parseFloat(String(v).replace(/[$,%\s]/g,""));return isNaN(n)?null:n;}
function fC(v){if(v==null)return"—";return v>=1e9?"$"+(v/1e9).toFixed(2)+"B":v>=1e6?"$"+(v/1e6).toFixed(2)+"M":v>=1e3?"$"+(v/1e3).toFixed(1)+"K":"$"+v.toFixed(0);}
function fP(v){return(v||0).toFixed(1)+"%";}
function fN(v){return(v||0).toLocaleString("en-US");}
function fR(v){return(v||0).toFixed(2)+"%";}
function fS(v){return String(Math.round(v||0));}

function ruleMatch(hdrs,rows,fields){var flds=fields||STD;var mp={},sc={};hdrs.forEach(function(h){var best=null,bs=0;Object.keys(flds).forEach(function(fk){var s=0;flds[fk].p.forEach(function(p){if(p.test(h.trim()))s+=50;});if(s>0&&rows.length>0){var vals=rows.slice(0,20).map(function(r){return r[h];}).filter(function(v){return v!=null&&v!=="";});if(vals.length>0){var nums=vals.map(pn).filter(function(v){return v!==null;}),nr=vals.length>0?nums.length/vals.length:0;if(nr>0.8){var av=_.mean(nums);if(av>300&&av<900)s+=15;else if(av>0&&av<35)s+=10;else if(av>100&&av<1e7)s+=5;}if(vals.filter(function(v){return/^[A-Z]{2}$/.test(String(v).trim());}).length>vals.length*0.5)s+=20;}}if(s>bs){bs=s;best=fk;}});if(best&&bs>=50){if(!sc[best]||bs>sc[best].s){if(sc[best])delete mp[sc[best].h];mp[h]=best;sc[best]={h:h,s:bs};}}});var r={};Object.keys(mp).forEach(function(h){r[mp[h]]=h;});return r;}

// Score how well a template's column names match incoming headers
function scoreTemplate(tpl,hdrs){
  var hits=0,total=0;
  Object.values(tpl.mapping).forEach(function(col){total++;if(hdrs.indexOf(col)>=0)hits++;});
  return total>0?hits/total:0;
}

async function aiMatch(hdrs,rows){var sample=hdrs.map(function(h){return h+": ["+rows.slice(0,4).map(function(r){return r[h];}).join(", ")+"]";}).join("\n");var fields=Object.keys(STD).map(function(k){return k+" ("+STD[k].l+")";}).join(", ");try{var res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:"Map columns to ABS fields. Fields: "+fields+"\n\nColumns:\n"+sample+"\n\nReturn ONLY JSON {\"field_key\":\"Column_Name\",...}:"}]})});var d=await res.json();var t=d.content.map(function(b){return b.text||"";}).join("");return JSON.parse(t.replace(/```json|```/g,"").trim());}catch(e){return{};}}

function doAnalyze(rows,mp){
  var gn=function(r,f){var c=mp[f];return c?pn(r[c]):null;};
  var gs=function(r,f){var c=mp[f];return c?String(r[c]||"").trim():"";};
  var bals=rows.map(function(r){return gn(r,"current_balance");}).filter(function(v){return v!==null;});
  var obs=rows.map(function(r){return gn(r,"original_balance");}).filter(function(v){return v!==null;});
  var tb=_.sum(bals),tob=_.sum(obs);
  var wa=function(f){if(!bals.length||!tb)return 0;return rows.reduce(function(a,r){var b=gn(r,"current_balance"),v=gn(r,f);return b&&v?a+b*v:a;},0)/tb;};
  var bkt=function(f,bs){return bs.map(function(b){var m=rows.filter(function(r){var v=gn(r,f);return v!==null&&v>=b.mn&&v<=b.mx;});var bl=_.sum(m.map(function(r){return gn(r,"current_balance")||0;}));return{name:b.l,count:m.length,balance:bl,pct:tb>0?(bl/tb)*100:0,field:f,mn:b.mn,mx:b.mx};});};
  var grp=function(f){var d={};rows.forEach(function(r){var k=gs(r,f)||"Unknown";if(!d[k])d[k]={c:0,b:0};d[k].c++;d[k].b+=gn(r,"current_balance")||0;});return Object.entries(d).map(function(e){return{name:e[0],count:e[1].c,balance:e[1].b,pct:tb>0?(e[1].b/tb)*100:0,field:f};}).sort(function(a,b){return b.balance-a.balance;});};
  var rates=rows.map(function(r){return gn(r,"interest_rate");}).filter(function(v){return v!==null;});
  var ficoDist=bkt("fico_origination",[{l:"<580",mn:0,mx:579},{l:"580-619",mn:580,mx:619},{l:"620-659",mn:620,mx:659},{l:"660-699",mn:660,mx:699},{l:"700-739",mn:700,mx:739},{l:"740-779",mn:740,mx:779},{l:"780+",mn:780,mx:999}]);
  var rateDist=bkt("interest_rate",[{l:"0-6%",mn:0,mx:6},{l:"6-9%",mn:6.01,mx:9},{l:"9-12%",mn:9.01,mx:12},{l:"12-18%",mn:12.01,mx:18},{l:"18-24%",mn:18.01,mx:24},{l:"24%+",mn:24.01,mx:99}]);
  var dtiDist=bkt("dti",[{l:"0-20%",mn:0,mx:20},{l:"20-30%",mn:20.01,mx:30},{l:"30-40%",mn:30.01,mx:40},{l:"40-50%",mn:40.01,mx:50},{l:"50%+",mn:50.01,mx:200}]);
  var termDist=bkt("original_term",[{l:"12-24",mn:12,mx:24},{l:"36",mn:25,mx:36},{l:"48",mn:37,mx:48},{l:"60",mn:49,mx:60},{l:"72-84",mn:61,mx:84}]);
  var geo=grp("state").slice(0,20),stat=grp("loan_status"),purp=grp("loan_purpose"),grad=grp("grade"),chan=grp("origination_channel"),veri=grp("income_verification"),hous=grp("housing_status"),vint=grp("vintage");
  var hhi=geo.reduce(function(a,g){return a+Math.pow(g.pct/100,2);},0);
  var dqC=function(pat){return tb>0?_.sum(stat.filter(function(s){return pat.test(s.name);}).map(function(s){return s.balance;}))/tb*100:0;};
  var coB=_.sum(stat.filter(function(s){return/charge|default|loss/i.test(s.name);}).map(function(s){return s.balance;}));
  var nl=rows.reduce(function(a,r){return a+(gn(r,"net_loss")||0);},0);
  var rec=rows.reduce(function(a,r){return a+(gn(r,"recoveries")||0);},0);
  var mobs=rows.map(function(r){return gn(r,"months_on_book");}).filter(function(v){return v!==null;});
  return{N:rows.length,tb:tb,tob:tob,avg:bals.length?tb/bals.length:0,waR:rates.length?wa("interest_rate"):0,waFO:wa("fico_origination"),waFC:wa("fico_current"),waD:wa("dti"),waM:mobs.length?_.mean(mobs):0,minR:rates.length?_.min(rates):0,maxR:rates.length?_.max(rates):0,ficoDist:ficoDist,rateDist:rateDist,dtiDist:dtiDist,termDist:termDist,geo:geo,stat:stat,purp:purp,grad:grad,chan:chan,veri:veri,hous:hous,vint:vint,hhi:hhi,tsc:geo.length>0?geo[0].pct:0,glr:tob>0?(coB/tob)*100:0,nlr:tob>0?(nl/tob)*100:0,nl:nl,rec:rec,pf:tob>0?(tb/tob)*100:0,dq30:dqC(/30/i),dq60:dqC(/60/i),dq90:dqC(/90|120|default|charge|bankrupt/i),has:function(f){return mp[f]!=null;}};
}
function doValidate(rows,mp){var tc=0,mc=0,oor=0,issues=[];var rules={current_balance:{a:0,b:1e8},original_balance:{a:0,b:1e8},interest_rate:{a:0,b:35},fico_origination:{a:300,b:900},fico_current:{a:300,b:900},dti:{a:0,b:100}};rows.forEach(function(row,idx){Object.keys(mp).forEach(function(f){tc++;var v=row[mp[f]];if(v==null||v===""){mc++;return;}if(rules[f]){var n=pn(v);if(n!==null&&(n<rules[f].a||n>rules[f].b)){oor++;if(issues.length<20)issues.push(f+"="+v+" row "+(idx+1));}}});});return{comp:tc>0?((tc-mc)/tc)*100:0,mc:mc,oor:oor,issues:issues};}

/* ── Regression & Stats ── */
function calcRegression(pts){
  // pts = [{x,y},...] — returns {slope, intercept, r2, r, n, line:[{x,y}]}
  if(!pts||pts.length<3)return null;
  var n=pts.length;
  var sx=0,sy=0,sxx=0,sxy=0,syy=0;
  pts.forEach(function(p){sx+=p.x;sy+=p.y;sxx+=p.x*p.x;sxy+=p.x*p.y;syy+=p.y*p.y;});
  var denom=n*sxx-sx*sx;
  if(denom===0)return null;
  var slope=(n*sxy-sx*sy)/denom;
  var intercept=(sy-slope*sx)/n;
  var yMean=sy/n;
  var ssTot=0,ssRes=0;
  pts.forEach(function(p){var yp=slope*p.x+intercept;ssTot+=(p.y-yMean)*(p.y-yMean);ssRes+=(p.y-yp)*(p.y-yp);});
  var r2=ssTot>0?1-ssRes/ssTot:0;
  var r=Math.sqrt(Math.abs(r2))*(slope>=0?1:-1);
  var xMin=_.min(pts.map(function(p){return p.x;}));
  var xMax=_.max(pts.map(function(p){return p.x;}));
  return{slope:slope,intercept:intercept,r2:r2,r:r,n:n,line:[{x:xMin,y:slope*xMin+intercept},{x:xMax,y:slope*xMax+intercept}]};
}

function calcMultiReg(pts3){
  // pts3 = [{x1,x2,y},...] — simple 2-variable OLS via normal equations
  if(!pts3||pts3.length<5)return null;
  var n=pts3.length;
  var sx1=0,sx2=0,sy=0,sx1x1=0,sx2x2=0,sx1x2=0,sx1y=0,sx2y=0;
  pts3.forEach(function(p){sx1+=p.x1;sx2+=p.x2;sy+=p.y;sx1x1+=p.x1*p.x1;sx2x2+=p.x2*p.x2;sx1x2+=p.x1*p.x2;sx1y+=p.x1*p.y;sx2y+=p.x2*p.y;});
  // Normal equations: X'X * b = X'y where X includes intercept
  // [n, sx1, sx2] [b0]   [sy]
  // [sx1,sx1x1,sx1x2] [b1] = [sx1y]
  // [sx2,sx1x2,sx2x2] [b2]   [sx2y]
  var A=[[n,sx1,sx2],[sx1,sx1x1,sx1x2],[sx2,sx1x2,sx2x2]];
  var B=[sy,sx1y,sx2y];
  // Gaussian elimination
  for(var i=0;i<3;i++){var mx=Math.abs(A[i][i]),mi=i;for(var j=i+1;j<3;j++){if(Math.abs(A[j][i])>mx){mx=Math.abs(A[j][i]);mi=j;}}if(mi!==i){var tmp=A[i];A[i]=A[mi];A[mi]=tmp;var tb=B[i];B[i]=B[mi];B[mi]=tb;}if(Math.abs(A[i][i])<1e-12)return null;for(var j2=i+1;j2<3;j2++){var f=A[j2][i]/A[i][i];for(var k=i;k<3;k++)A[j2][k]-=f*A[i][k];B[j2]-=f*B[i];}}
  var coef=[0,0,0];for(var i2=2;i2>=0;i2--){var s=B[i2];for(var j3=i2+1;j3<3;j3++)s-=A[i2][j3]*coef[j3];coef[i2]=s/A[i2][i2];}
  var yMean=sy/n,ssTot=0,ssRes=0;
  pts3.forEach(function(p){var yp=coef[0]+coef[1]*p.x1+coef[2]*p.x2;ssTot+=(p.y-yMean)*(p.y-yMean);ssRes+=(p.y-yp)*(p.y-yp);});
  var r2=ssTot>0?1-ssRes/ssTot:0;
  var adjR2=n>3?1-(1-r2)*(n-1)/(n-3):r2;
  return{b0:coef[0],b1:coef[1],b2:coef[2],r2:r2,adjR2:adjR2,n:n};
}

/* ═══ APP ═══ */
export default function App(){
  var _d=useState(null),data=_d[0],setData=_d[1];
  var _h=useState([]),hdrs=_h[0],setHdrs=_h[1];
  var _m=useState({}),mp=_m[0],setMp=_m[1];
  var _a=useState(null),an=_a[0],setAn=_a[1];
  var _v=useState(null),vl=_v[0],setVl=_v[1];
  var _t=useState("mapping"),tab=_t[0],setTab=_t[1];
  var _ld=useState(false),ld=_ld[0],setLd=_ld[1];
  var _fn=useState(""),fn=_fn[0],setFn=_fn[1];
  var _sr=useState(""),search=_sr[0],setSearch=_sr[1];
  var _sc=useState(null),sortC=_sc[0],setSortC=_sc[1];
  var _sd=useState("asc"),sortD=_sd[0],setSortD=_sd[1];
  var _pg=useState(0),pg=_pg[0],setPg=_pg[1];
  var _ai=useState(false),aiL=_ai[0],setAiL=_ai[1];
  var _dr=useState(false),dragO=_dr[0],setDragO=_dr[1];
  // drill state
  var _dd=useState(null),drill=_dd[0],setDrill=_dd[1];
  var _dp=useState(0),drPg=_dp[0],setDrPg=_dp[1];
  var _ds=useState(""),drSr=_ds[0],setDrSr=_ds[1];
  var _dc=useState(null),drCols=_dc[0],setDrCols=_dc[1]; // ordered columns for drill
  var _dsc=useState(null),drSortC=_dsc[0],setDrSortC=_dsc[1];
  var _dsd=useState("asc"),drSortD=_dsd[0],setDrSortD=_dsd[1];
  var _dcp=useState(false),showColPick=_dcp[0],setShowColPick=_dcp[1];
  // custom strats
  var _cs=useState([]),custStrats=_cs[0],setCustStrats=_cs[1];
  var _csEdit=useState(null),csEdit=_csEdit[0],setCsEdit=_csEdit[1];
  // chart builder state
  var _chX=useState(""),chX=_chX[0],setChX=_chX[1];
  var _chY=useState(""),chY=_chY[0],setChY=_chY[1];
  var _chZ=useState(""),chZ=_chZ[0],setChZ=_chZ[1]; // optional 3rd var
  var _chColor=useState(""),chColor=_chColor[0],setChColor=_chColor[1]; // color-by column
  var _chReg=useState(false),chReg=_chReg[0],setChReg=_chReg[1]; // show regression
  var _chSaved=useState([]),chSaved=_chSaved[0],setChSaved=_chSaved[1];
  // admin: custom fields & originator templates
  var _custFields=useState([]),custFields=_custFields[0],setCustFields=_custFields[1]; // [{key,label,patterns:[]}]
  var _cfEdit=useState(null),cfEdit=_cfEdit[0],setCfEdit=_cfEdit[1];
  var _templates=useState([]),templates=_templates[0],setTemplates=_templates[1]; // [{id,name,originator,mapping:{}}]
  var _tplEdit=useState(null),tplEdit=_tplEdit[0],setTplEdit=_tplEdit[1];
  var _adminSub=useState("fields"),adminSub=_adminSub[0],setAdminSub=_adminSub[1];
  var _sugTpl=useState(null),sugTpl=_sugTpl[0],setSugTpl=_sugTpl[1];
  var _qaf=useState(null),qaf=_qaf[0],setQaf=_qaf[1]; // quick-add-field from mapping tab {col,key,label,altNames}
  var fr=useRef();

  // Merged fields: STD + custom
  var allFields=useMemo(function(){
    var merged=Object.assign({},STD);
    custFields.forEach(function(cf){
      // Convert alt names to fuzzy regex: "prepay speed" → /prepay.?speed/i
      var pats=cf.patterns.map(function(s){
        try{
          // If it looks like a regex (has special chars), use as-is
          if(/[.?*+\[\]()\\^$|{}]/.test(s))return new RegExp(s,"i");
          // Otherwise convert spaces/underscores to .? for fuzzy match
          var fuzzy=s.trim().replace(/[\s_-]+/g,".?");
          return new RegExp(fuzzy,"i");
        }catch(e){return null;}
      }).filter(Boolean);
      merged[cf.key]={l:cf.label,p:pats};
    });
    return merged;
  },[custFields]);

  // CSV download helper
  var downloadCSV=useCallback(function(rows,cols,filename){
    var header=cols.join(",");
    var body=rows.map(function(r){return cols.map(function(c){var v=r[c];if(v==null)return"";var s=String(v);if(s.indexOf(",")>=0||s.indexOf('"')>=0||s.indexOf("\n")>=0)return'"'+s.replace(/"/g,'""')+'"';return s;}).join(",");}).join("\n");
    var blob=new Blob([header+"\n"+body],{type:"text/csv"});
    var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download=filename||"export.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  },[]);

  var rerun=useCallback(function(rows,m){setAn(doAnalyze(rows,m));setVl(doValidate(rows,m));},[]);
  var proc=useCallback(function(rows,name){setLd(true);setTimeout(function(){
    var h=Object.keys(rows[0]||{});
    // Score all saved templates against incoming column headers
    var bestTpl=null,bestScore=0;
    templates.forEach(function(tpl){var s=scoreTemplate(tpl,h);if(s>bestScore){bestScore=s;bestTpl=tpl;}});
    var m;
    if(bestTpl&&bestScore>=0.8){
      // Strong match (>=80% columns found) — auto-apply template
      m=Object.assign({},bestTpl.mapping);
      // Only keep mappings where the column actually exists in this tape
      Object.keys(m).forEach(function(k){if(h.indexOf(m[k])<0)delete m[k];});
      setSugTpl({tpl:bestTpl,score:bestScore,applied:true});
    } else {
      // Fall back to rule-based matching using allFields
      m=ruleMatch(h,rows,allFields);
      if(bestTpl&&bestScore>=0.4){
        setSugTpl({tpl:bestTpl,score:bestScore,applied:false});
      } else {
        setSugTpl(null);
      }
    }
    setHdrs(h);setMp(m);setData(rows);setFn(name);setAn(doAnalyze(rows,m));setVl(doValidate(rows,m));setLd(false);setTab("mapping");setPg(0);
  },150);},[templates,allFields]);
  var hFile=useCallback(function(f){if(!f)return;Papa.parse(f,{header:true,skipEmptyLines:"greedy",dynamicTyping:true,complete:function(r){proc(r.data.filter(function(row){return Object.values(row).some(function(v){return v!==null&&v!==""&&v!==undefined;});}),f.name);}});},[proc]);
  var doAi=useCallback(async function(){if(!data)return;setAiL(true);try{var r=await aiMatch(hdrs,data);setMp(r);rerun(data,r);}catch(e){}setAiL(false);},[data,hdrs,rerun]);
  var updMap=useCallback(function(fk,hv){var n=Object.assign({},mp);if(hv==="")delete n[fk];else n[fk]=hv;setMp(n);if(data)rerun(data,n);},[mp,data,rerun]);

  // Clean mapping: only keep fields with valid column references
  var cleanMp=useCallback(function(){
    var clean={};Object.keys(mp).forEach(function(k){if(mp[k]&&hdrs.indexOf(mp[k])>=0)clean[k]=mp[k];});return clean;
  },[mp,hdrs]);

  // Smart column ordering for drill-down
  var buildDrillCols=useCallback(function(relevantField){
    // Priority: loan_id, relevant field column, current_balance, original_balance, key fields, then rest
    var idCol=mp.loan_id;
    var relCol=relevantField?mp[relevantField]:null;
    var keyFields=["current_balance","original_balance","interest_rate","fico_origination","fico_current","dti","loan_status","grade","state","loan_purpose","months_on_book"];
    var ordered=[];
    var used={};
    var addCol=function(c){if(c&&!used[c]){ordered.push(c);used[c]=true;}};
    // 1. Loan ID
    addCol(idCol);
    // 2. Relevant strat column
    addCol(relCol);
    // 3. Key financial columns
    keyFields.forEach(function(f){addCol(mp[f]);});
    // 4. All remaining source columns
    hdrs.forEach(function(h){addCol(h);});
    return ordered;
  },[mp,hdrs]);

  // Drill-down opener
  var openDrill=useCallback(function(title,filterFn,relevantField){
    if(!data)return;
    var filtered=data.filter(filterFn);
    var cols=buildDrillCols(relevantField);
    setDrill({title:title,rows:filtered});
    setDrCols(cols);setDrPg(0);setDrSr("");setDrSortC(null);setShowColPick(false);
  },[data,buildDrillCols]);

  // Move column in drill view
  var moveCol=useCallback(function(fromIdx,dir){
    if(!drCols)return;
    var toIdx=fromIdx+dir;
    if(toIdx<0||toIdx>=drCols.length)return;
    var nc=[].concat(drCols);
    var tmp=nc[fromIdx];nc[fromIdx]=nc[toIdx];nc[toIdx]=tmp;
    setDrCols(nc);
  },[drCols]);

  // Toggle column visibility
  var toggleCol=useCallback(function(col){
    if(!drCols)return;
    var idx=drCols.indexOf(col);
    if(idx>=0){
      setDrCols(drCols.filter(function(c){return c!==col;}));
    } else {
      setDrCols(drCols.concat([col]));
    }
  },[drCols]);

  var fd=useMemo(function(){if(!data)return[];var r=data;if(search){var t=search.toLowerCase();r=r.filter(function(x){return Object.values(x).some(function(v){return String(v).toLowerCase().includes(t);});});}if(sortC){r=[].concat(r).sort(function(a,b){var va=pn(a[sortC]),vb=pn(b[sortC]);if(va!==null&&vb!==null)return sortD==="asc"?va-vb:vb-va;return sortD==="asc"?String(a[sortC]||"").localeCompare(String(b[sortC]||"")):String(b[sortC]||"").localeCompare(String(a[sortC]||""));});}return r;},[data,search,sortC,sortD]);
  var PS=50,pagedD=fd.slice(pg*PS,(pg+1)*PS),totPg=Math.ceil(fd.length/PS);

  // Drill computed
  var drRows=drill?drill.rows:[];
  var drFilt=drSr?drRows.filter(function(r){return Object.values(r).some(function(v){return String(v).toLowerCase().includes(drSr.toLowerCase());});}):drRows;
  if(drSortC){drFilt=[].concat(drFilt).sort(function(a,b){var va=pn(a[drSortC]),vb=pn(b[drSortC]);if(va!==null&&vb!==null)return drSortD==="asc"?va-vb:vb-va;return drSortD==="asc"?String(a[drSortC]||"").localeCompare(String(b[drSortC]||"")):String(b[drSortC]||"").localeCompare(String(a[drSortC]||""));});}
  var drPS=25,drPaged=drFilt.slice(drPg*drPS,(drPg+1)*drPS),drTP=Math.ceil(drFilt.length/drPS);
  var drBal=drill?_.sum(drFilt.map(function(r){return pn(r[mp.current_balance])||0;})):0;
  var drDispCols=drCols||hdrs;

  // Pre-compute unmapped source columns
  var unmappedCols=useMemo(function(){
    if(!hdrs.length)return[];
    var mappedCols={};Object.values(mp).forEach(function(c){if(c)mappedCols[c]=true;});
    return hdrs.filter(function(h){return!mappedCols[h];});
  },[hdrs,mp]);

  var TABS=[{id:"mapping",l:"Column Mapping",i:Brain},{id:"overview",l:"Pool Overview",i:Activity},{id:"cracking",l:"Tape Cracking",i:Wand2},{id:"quality",l:"Data Quality",i:Shield},{id:"strats",l:"Stratifications",i:BarChart3},{id:"custom",l:"Custom Strats",i:Plus},{id:"charts",l:"Charts & Regression",i:TrendingUp},{id:"concentration",l:"Concentration",i:Layers},{id:"risk",l:"Risk Summary",i:TrendingUp},{id:"admin",l:"Admin / Templates",i:Settings},{id:"data",l:"Raw Data",i:Database}];

  // ═══ UPLOAD ═══
  if(!data)return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{maxWidth:560,width:"100%",padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:36}}><div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{width:42,height:42,borderRadius:11,background:"linear-gradient(135deg,"+T.ac+","+T.bu+")",display:"flex",alignItems:"center",justifyContent:"center"}}><Layers size={20} color="#fff"/></div><div><h1 style={{fontSize:22,fontWeight:800,color:T.tx,margin:0}}>Loan Tape Analyzer</h1><div style={{fontSize:9,color:T.tm,letterSpacing:"1px",textTransform:"uppercase"}}>ABS Tape Cracking Platform</div></div></div><p style={{fontSize:12,color:T.td,maxWidth:400,margin:"0 auto",lineHeight:1.5}}>AI column mapping, stratification, tape cracking with click-to-drill analytics.</p></div>
        <div onDragOver={function(e){e.preventDefault();setDragO(true);}} onDragLeave={function(){setDragO(false);}} onDrop={function(e){e.preventDefault();setDragO(false);if(e.dataTransfer.files[0])hFile(e.dataTransfer.files[0]);}} onClick={function(){fr.current&&fr.current.click();}} style={{border:"2px dashed "+(dragO?T.ac:T.bl),borderRadius:14,padding:"44px 24px",textAlign:"center",cursor:"pointer",background:dragO?T.ad:T.cd}}>
          <input ref={fr} type="file" accept=".csv,.tsv" onChange={function(e){hFile(e.target.files[0]);}} style={{display:"none"}}/>
          <Upload size={30} color={dragO?T.ac:T.td} style={{marginBottom:10}}/><div style={{fontSize:14,fontWeight:600,color:T.tx,marginBottom:3}}>Drop CSV here</div><div style={{fontSize:11,color:T.td}}>Click any metric, chart bar, or strat row to drill into loans</div>
        </div>
        <div style={{marginTop:16,textAlign:"center"}}><div style={{fontSize:10,color:T.td,marginBottom:8}}>Or try with sample data:</div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <button onClick={function(){fetch(process.env.PUBLIC_URL+"/sample-data/consumer_unsecured_loan_tape.csv").then(function(r){return r.text();}).then(function(txt){var r=Papa.parse(txt,{header:true,skipEmptyLines:"greedy",dynamicTyping:true});proc(r.data.filter(function(row){return Object.values(row).some(function(v){return v!==null&&v!==""&&v!==undefined;})}),"consumer_unsecured_loan_tape.csv");});}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,padding:"10px 16px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:11,fontWeight:600,color:T.ac}}>Consumer Unsecured</div>
              <div style={{fontSize:9,color:T.td}}>1,000 loans · 88 cols · Clean</div>
            </button>
            <button onClick={function(){fetch(process.env.PUBLIC_URL+"/sample-data/quickdrive_auto_loan_tape.csv").then(function(r){return r.text();}).then(function(txt){var r=Papa.parse(txt,{header:true,skipEmptyLines:"greedy",dynamicTyping:true});proc(r.data.filter(function(row){return Object.values(row).some(function(v){return v!==null&&v!==""&&v!==undefined;})}),"quickdrive_auto_loan_tape.csv");});}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,padding:"10px 16px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:11,fontWeight:600,color:T.wn}}>QuickDrive Auto Loans</div>
              <div style={{fontSize:9,color:T.td}}>500 loans · 73 cols · Messy</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  var a=an,mCt=Object.keys(mp).filter(function(k){return mp[k]&&hdrs.indexOf(mp[k])>=0;}).length,tF=Object.keys(allFields).length;

  // ─── helpers (inline, pure JSX, inside App) ───
  var mc_=function(icon,label,value,color,sub,onClick){var I=icon;return <div onClick={onClick} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:"12px 14px",display:"flex",flexDirection:"column",gap:3,cursor:onClick?"pointer":"default"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:24,height:24,borderRadius:6,background:(color||T.ac)+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><I size={11} color={color||T.ac}/></div><span style={{fontSize:8,color:T.tm,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.3px"}}>{label}</span></div><div style={{fontSize:18,fontWeight:700,color:T.tx,fontFamily:"monospace"}}>{value}</div>{sub?<div style={{fontSize:8,color:T.td}}>{sub}</div>:null}{onClick?<div style={{fontSize:7,color:T.ac}}>click to drill ↗</div>:null}</div>;};

  var cc_=function(title,Icon,children){return <div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:16,display:"flex",flexDirection:"column",gap:10}}><div style={{display:"flex",alignItems:"center",gap:7}}>{Icon?<Icon size={12} color={T.ac}/>:null}<span style={{fontSize:12,fontWeight:600,color:T.tx}}>{title}</span></div>{children}</div>;};

  var renderStrat=function(dta,total,color){
    return <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}><thead><tr>{["Bucket","#","Balance","% Bal",""].map(function(h){return <th key={h} style={{textAlign:"left",padding:"5px 8px",borderBottom:"1px solid "+T.bd,color:T.tm,fontWeight:600,fontSize:8,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead><tbody>{dta.map(function(r,i){return <tr key={i} style={{borderBottom:"1px solid "+T.bd,cursor:"pointer"}} onClick={function(){if(r.mn!==undefined)openDrill(r.name,function(row){var v=pn(row[mp[r.field]]);return v!==null&&v>=r.mn&&v<=r.mx;},r.field);else openDrill(r.name,function(row){return String(row[mp[r.field]]||"").trim()===r.name||(r.name==="Unknown"&&!String(row[mp[r.field]]||"").trim());},r.field);}} onMouseEnter={function(e){e.currentTarget.style.background=T.sf;}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
      <td style={{padding:"5px 8px",fontWeight:500}}>{r.name}</td>
      <td style={{padding:"5px 8px",fontFamily:"monospace"}}>{fN(r.count)}</td>
      <td style={{padding:"5px 8px",fontFamily:"monospace"}}>{fC(r.balance)}</td>
      <td style={{padding:"5px 8px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:40,height:3,background:T.bd,borderRadius:2}}><div style={{width:Math.min(r.pct,100)+"%",height:"100%",background:color||T.ac,borderRadius:2}}/></div><span style={{fontFamily:"monospace",fontSize:8}}>{fP(r.pct)}</span></div></td>
      <td style={{padding:"5px 8px"}}><ExternalLink size={9} color={T.td}/></td>
    </tr>;})}</tbody></table>;
  };

  // ═══ MAIN RENDER ═══
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"-apple-system,sans-serif",color:T.tx}}>

      {/* ══ DRILL-DOWN MODAL ══ */}
      {drill&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:12}} onClick={function(e){if(e.target===e.currentTarget)setDrill(null);}}>
        <div style={{background:T.bg,border:"1px solid "+T.bd,borderRadius:14,width:"97%",maxWidth:1400,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Drill header */}
          <div style={{padding:"10px 16px",borderBottom:"1px solid "+T.bd,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div><div style={{fontSize:14,fontWeight:700}}>{drill.title}</div><div style={{fontSize:10,color:T.tm,marginTop:1}}>{fN(drFilt.length)} loans · {fC(drBal)} balance</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button onClick={function(){downloadCSV(drFilt,drDispCols,(drill.title||"drill")+"_export.csv");}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"4px 8px",color:T.ac,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Download size={10}/> CSV</button>
              <button onClick={function(){setShowColPick(!showColPick);}} style={{background:showColPick?T.ad:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"4px 8px",color:showColPick?T.ac:T.tm,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Settings size={10}/> Columns ({drDispCols.length})</button>
              <div style={{position:"relative"}}><Search size={10} color={T.td} style={{position:"absolute",left:6,top:6}}/><input value={drSr} onChange={function(e){setDrSr(e.target.value);setDrPg(0);}} placeholder="Filter..." style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"4px 7px 4px 22px",color:T.tx,fontSize:9,width:130,outline:"none"}}/></div>
              <button onClick={function(){setDrill(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.tm}}><X size={11}/></button>
            </div>
          </div>
          {/* Column picker */}
          {showColPick&&<div style={{padding:"8px 16px",borderBottom:"1px solid "+T.bd,maxHeight:120,overflow:"auto",flexShrink:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
              {hdrs.map(function(h,idx){var active=drDispCols.indexOf(h)>=0;var colIdx=drDispCols.indexOf(h);return <div key={h} style={{display:"flex",alignItems:"center",gap:2,background:active?T.ad:T.sf,border:"1px solid "+(active?T.ac+"40":T.bd),borderRadius:4,padding:"2px 6px",fontSize:8,color:active?T.ac:T.td,cursor:"pointer"}} onClick={function(){toggleCol(h);}}>
                {active&&colIdx>0&&<span onClick={function(e){e.stopPropagation();moveCol(colIdx,-1);}} style={{cursor:"pointer",padding:"0 2px"}}>◀</span>}
                <span>{h}</span>
                {active&&colIdx<drDispCols.length-1&&<span onClick={function(e){e.stopPropagation();moveCol(colIdx,1);}} style={{cursor:"pointer",padding:"0 2px"}}>▶</span>}
              </div>;})}
            </div>
          </div>}
          {/* Drill table */}
          <div style={{overflow:"auto",flex:1}}>
            <table style={{width:"max-content",minWidth:"100%",borderCollapse:"collapse",fontSize:9}}>
              <thead><tr>{drDispCols.map(function(h){return <th key={h} onClick={function(){if(drSortC===h)setDrSortD(drSortD==="asc"?"desc":"asc");else{setDrSortC(h);setDrSortD("asc");}}} style={{textAlign:"left",padding:"6px 8px",borderBottom:"1px solid "+T.bd,color:drSortC===h?T.ac:T.tm,fontWeight:600,fontSize:8,whiteSpace:"nowrap",position:"sticky",top:0,background:T.bg,cursor:"pointer",minWidth:70}}>{h}{drSortC===h?(drSortD==="asc"?" ↑":" ↓"):""}</th>;})}</tr></thead>
              <tbody>{drPaged.map(function(row,i){return <tr key={i} style={{borderBottom:"1px solid "+T.bd}}>{drDispCols.map(function(h){return <td key={h} style={{padding:"4px 8px",whiteSpace:"nowrap",fontFamily:typeof row[h]==="number"?"monospace":"inherit",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{String(row[h]!=null?row[h]:"")}</td>;})}</tr>;})}</tbody>
            </table>
          </div>
          {/* Drill pagination */}
          {drTP>1&&<div style={{padding:"6px 16px",borderTop:"1px solid "+T.bd,display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexShrink:0}}>
            <button onClick={function(){setDrPg(Math.max(0,drPg-1));}} disabled={drPg===0} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 8px",color:drPg===0?T.td:T.tx,fontSize:9,cursor:"pointer"}}>Prev</button>
            <span style={{fontSize:9,color:T.tm}}>{drPg+1}/{drTP}</span>
            <button onClick={function(){setDrPg(Math.min(drTP-1,drPg+1));}} disabled={drPg>=drTP-1} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 8px",color:drPg>=drTP-1?T.td:T.tx,fontSize:9,cursor:"pointer"}}>Next</button>
          </div>}
        </div>
      </div>}

      {/* HEADER */}
      <header style={{background:T.sf,borderBottom:"1px solid "+T.bd,padding:"0 18px",display:"flex",alignItems:"center",justifyContent:"space-between",height:42,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:22,height:22,borderRadius:5,background:"linear-gradient(135deg,"+T.ac+","+T.bu+")",display:"flex",alignItems:"center",justifyContent:"center"}}><Layers size={10} color="#fff"/></div><span style={{fontSize:12,fontWeight:700}}>Loan Tape Analyzer</span><span style={{fontSize:8,color:T.td}}>{fn}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:8,color:T.tm,fontFamily:"monospace"}}>{fN(a.N)} · {fC(a.tb)} · {mCt}/{tF} mapped</span><button onClick={function(){setData(null);setAn(null);setVl(null);}} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:4,padding:"2px 8px",color:T.tm,fontSize:8,cursor:"pointer"}}><RefreshCw size={8}/></button></div>
      </header>

      {(ld||aiL)&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}><div style={{background:T.cd,borderRadius:10,padding:28,textAlign:"center"}}><Brain size={22} color={T.ac}/><div style={{color:T.tx,fontWeight:600,fontSize:12,marginTop:6}}>{aiL?"AI matching...":"Processing..."}</div></div></div>}

      <div style={{display:"flex"}}>
        <nav style={{width:170,background:T.sf,borderRight:"1px solid "+T.bd,padding:"8px 6px",position:"sticky",top:42,height:"calc(100vh - 42px)",flexShrink:0,overflow:"auto"}}>{TABS.map(function(t){var ac=tab===t.id;var I=t.i;return <button key={t.id} onClick={function(){setTab(t.id);}} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 9px",border:"none",borderRadius:5,cursor:"pointer",marginBottom:1,fontSize:10,fontWeight:500,background:ac?T.ad:"transparent",color:ac?T.ac:T.tm}}><I size={11}/>{t.l}</button>;})}</nav>

        <main style={{flex:1,padding:18,maxWidth:1200,overflow:"auto"}}>

{/* ═══ MAPPING ═══ */}
{tab==="mapping"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><h2 style={{fontSize:15,fontWeight:700,margin:0}}>Column Mapping</h2><p style={{fontSize:10,color:T.td,margin:"2px 0 0"}}>{mCt}/{Object.keys(allFields).length} mapped · {hdrs.length} source cols</p></div>
  <div style={{display:"flex",gap:6}}>
    {templates.length>0&&<select onChange={function(e){var t=templates.find(function(t2){return String(t2.id)===e.target.value;});if(t){setMp(Object.assign({},t.mapping));if(data)rerun(data,t.mapping);}}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"5px 8px",color:T.tx,fontSize:9,cursor:"pointer"}}><option value="">Load Template...</option>{templates.map(function(t){return <option key={t.id} value={t.id}>{t.name}{t.originator?" ("+t.originator+")":""}</option>;})}</select>}
    <button onClick={function(){setTplEdit({name:"",originator:""});}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"5px 10px",color:T.ac,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><Download size={9}/> Save as Template</button>
    <button onClick={doAi} disabled={aiL} style={{background:"linear-gradient(135deg,"+T.ac+","+T.bu+")",border:"none",borderRadius:7,padding:"7px 14px",color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Brain size={12}/>{aiL?"Matching...":"AI Auto-Match"}</button>
  </div></div>
  {/* Save template dialog */}
  {tplEdit&&<div style={{background:T.cd,border:"1px solid "+T.ac+"40",borderRadius:8,padding:12,display:"flex",gap:6,alignItems:"flex-end"}}>
    <div style={{flex:1}}><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Template Name</div><input value={tplEdit.name} onChange={function(e){setTplEdit(Object.assign({},tplEdit,{name:e.target.value}));}} placeholder="e.g. LendingClub Standard" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
    <div style={{flex:1}}><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Originator</div><input value={tplEdit.originator} onChange={function(e){setTplEdit(Object.assign({},tplEdit,{originator:e.target.value}));}} placeholder="e.g. LendingClub, Prosper, SoFi" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
    <button onClick={function(){if(!tplEdit.name)return;setTemplates(templates.concat([{id:Date.now(),name:tplEdit.name,originator:tplEdit.originator,mapping:cleanMp()}]));setTplEdit(null);}} style={{background:T.ac,border:"none",borderRadius:5,padding:"6px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer"}}>Save</button>
    <button onClick={function(){setTplEdit(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"6px 12px",color:T.tm,fontSize:9,cursor:"pointer"}}>Cancel</button>
  </div>}
  {/* Template match suggestion */}
  {sugTpl&&<div style={{background:sugTpl.applied?T.ac+"15":T.wn+"15",border:"1px solid "+(sugTpl.applied?T.ac+"50":T.wn+"50"),borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div>
      <div style={{fontSize:10,fontWeight:600,color:sugTpl.applied?T.ac:T.wn}}>{sugTpl.applied?"✓ Auto-applied template":"Template suggestion detected"}</div>
      <div style={{fontSize:9,color:T.tm,marginTop:1}}>"{sugTpl.tpl.name}"{sugTpl.tpl.originator?" ("+sugTpl.tpl.originator+")":""} — {Math.round(sugTpl.score*100)}% column match</div>
    </div>
    <div style={{display:"flex",gap:4}}>
      {!sugTpl.applied&&<button onClick={function(){
        var nm=Object.assign({},sugTpl.tpl.mapping);
        Object.keys(nm).forEach(function(k){if(hdrs.indexOf(nm[k])<0)delete nm[k];});
        setMp(nm);if(data)rerun(data,nm);setSugTpl({tpl:sugTpl.tpl,score:sugTpl.score,applied:true});
      }} style={{background:T.ac,border:"none",borderRadius:5,padding:"5px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer"}}>Apply Template</button>}
      <button onClick={function(){setSugTpl(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"5px 10px",color:T.tm,fontSize:9,cursor:"pointer"}}>Dismiss</button>
    </div>
  </div>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:4}}>
    {Object.keys(allFields).map(function(fk){var f=allFields[fk];var mapped=mp[fk];var isCustom=!STD[fk];return <div key={fk} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",background:T.sf,borderRadius:5,border:"1px solid "+(mapped?T.ac+"40":T.bd)}}>
      {mapped?<CheckCircle size={10} color={T.ac}/>:<div style={{width:10,height:10,borderRadius:"50%",border:"1.5px solid "+T.td}}/>}
      <span style={{fontSize:9,fontWeight:600,color:T.tx,flex:1}}>{f.l}{isCustom?" ★":""}</span>
      <select value={mapped||""} onChange={function(e){updMap(fk,e.target.value);}} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:3,padding:"1px 3px",color:mapped?T.ac:T.td,fontSize:8,maxWidth:120,cursor:"pointer"}}><option value="">—</option>{hdrs.map(function(h){return <option key={h} value={h}>{h}</option>;})}</select>
    </div>;})}
  </div>
  {/* Unmapped source columns */}
  {unmappedCols.length>0&&<div style={{marginTop:6}}>
    <div style={{fontSize:10,fontWeight:600,color:T.wn,marginBottom:6}}>Unmapped Source Columns ({unmappedCols.length})</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
      {unmappedCols.map(function(col){
        var sampleVals=data?data.slice(0,3).map(function(r){return r[col];}).filter(function(v){return v!=null;}).join(", "):"";
        return <div key={col} style={{display:"flex",alignItems:"center",gap:4,background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 7px",fontSize:8}}>
          <span style={{color:T.wn,fontWeight:500}}>{col}</span>
          {sampleVals?<span style={{color:T.td,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={sampleVals}>{sampleVals}</span>:null}
          <button onClick={function(){
            var autoKey=col.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").substring(0,30);
            // If key already exists in STD or custom, append _custom
            if(STD[autoKey]||custFields.some(function(f){return f.key===autoKey;}))autoKey=autoKey+"_custom";
            setQaf({col:col,key:autoKey,label:col,altNames:col});
          }} style={{background:T.ac+"20",border:"1px solid "+T.ac+"40",borderRadius:3,padding:"1px 5px",color:T.ac,fontSize:7,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add as Field</button>
        </div>;
      })}
    </div>
  </div>}
  {/* Quick-add-field dialog */}
  {qaf!==null&&<div style={{background:T.cd,border:"1px solid "+T.ac+"50",borderRadius:8,padding:12,marginTop:6}}>
    <div style={{fontSize:10,fontWeight:600,marginBottom:6}}>Add "{qaf.col}" as a Standard Field</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:8,marginBottom:8}}>
      <div><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Field Key</div><input value={qaf.key} onChange={function(e){setQaf(Object.assign({},qaf,{key:e.target.value.replace(/[^a-z0-9_]/g,"")}));}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 6px",color:T.tx,fontSize:9,outline:"none"}}/></div>
      <div><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Display Label</div><input value={qaf.label} onChange={function(e){setQaf(Object.assign({},qaf,{label:e.target.value}));}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 6px",color:T.tx,fontSize:9,outline:"none"}}/></div>
      <div><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Alternate Names (comma-sep, for future auto-matching)</div><input value={qaf.altNames} onChange={function(e){setQaf(Object.assign({},qaf,{altNames:e.target.value}));}} placeholder="prepay speed, cpr rate" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 6px",color:T.tx,fontSize:9,outline:"none"}}/></div>
    </div>
    <div style={{fontSize:8,color:T.td,marginBottom:8}}>Creates a new standard field, maps it to "{qaf.col}", and stores alternate names for future auto-matching.</div>
    {(STD[qaf.key]||custFields.some(function(f){return f.key===qaf.key;}))?<div style={{fontSize:9,color:T.dg,marginBottom:6}}>Key "{qaf.key}" already exists — please change it</div>:null}
    <div style={{display:"flex",gap:6}}>
      <button onClick={function(){
        if(!qaf.key||!qaf.label)return;
        if(STD[qaf.key]||custFields.some(function(f){return f.key===qaf.key;}))return;
        var patterns=qaf.altNames.split(",").map(function(s){return s.trim();}).filter(Boolean);
        setCustFields(custFields.concat([{key:qaf.key,label:qaf.label,patterns:patterns}]));
        var nm=Object.assign({},mp);nm[qaf.key]=qaf.col;setMp(nm);if(data)rerun(data,nm);
        setQaf(null);
      }} style={{background:T.ac,border:"none",borderRadius:5,padding:"5px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer"}}>Add Field & Map</button>
      <button onClick={function(){setQaf(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"5px 10px",color:T.tm,fontSize:9,cursor:"pointer"}}>Cancel</button>
    </div>
  </div>}
</div>}

{/* ═══ OVERVIEW ═══ */}
{tab==="overview"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontSize:15,fontWeight:700,margin:0}}>Pool Overview</h2>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:8}}>
    {mc_(Database,"Loans",fN(a.N),T.bu,null,function(){openDrill("All Loans",function(){return true;},null);})}
    {mc_(DollarSign,"Curr Bal",fC(a.tb),T.ac,"Avg: "+fC(a.avg))}
    {a.tob>0&&mc_(DollarSign,"Orig Bal",fC(a.tob),T.bu,"Factor: "+fP(a.pf))}
    {a.has("interest_rate")&&mc_(TrendingUp,"WA Rate",fR(a.waR),T.wn,fR(a.minR)+" – "+fR(a.maxR),function(){openDrill("All Loans (sorted by Rate)",function(){return true;},"interest_rate");})}
    {a.has("fico_origination")&&mc_(Shield,"WA FICO",fS(a.waFO),a.waFO>=700?T.ac:a.waFO>=660?T.wn:T.dg,null,function(){openDrill("All Loans (sorted by FICO)",function(){return true;},"fico_origination");})}
    {a.has("dti")&&mc_(BarChart3,"WA DTI",fP(a.waD),a.waD<=36?T.ac:T.wn,null,function(){openDrill("All Loans (sorted by DTI)",function(){return true;},"dti");})}
    {a.has("months_on_book")&&mc_(Activity,"Seasoning",Math.round(a.waM)+" mo",T.pu)}
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
    {a.has("fico_origination")&&cc_("FICO (click bars)",Shield,<ResponsiveContainer width="100%" height={170}><BarChart data={a.ficoDist} barSize={18} onClick={function(d){if(d&&d.activeTooltipIndex!=null){var it=a.ficoDist[d.activeTooltipIndex];if(it)openDrill("FICO: "+it.name,function(r){var v=pn(r[mp[it.field]]);return v!==null&&v>=it.mn&&v<=it.mx;},"fico_origination");}}}><CartesianGrid strokeDasharray="3 3" stroke={T.bd}/><XAxis dataKey="name" tick={{fill:T.td,fontSize:8}} axisLine={{stroke:T.bd}}/><YAxis tick={{fill:T.td,fontSize:8}} axisLine={{stroke:T.bd}} tickFormatter={function(v){return v.toFixed(0)+"%";}}/><Tooltip/><Bar dataKey="pct" name="% Bal" radius={[3,3,0,0]} cursor="pointer">{a.ficoDist.map(function(e,i){return <Cell key={i} fill={PL[i%PL.length]}/>;})}</Bar></BarChart></ResponsiveContainer>)}
    {a.has("interest_rate")&&cc_("Rate (click bars)",TrendingUp,<ResponsiveContainer width="100%" height={170}><BarChart data={a.rateDist} barSize={18} onClick={function(d){if(d&&d.activeTooltipIndex!=null){var it=a.rateDist[d.activeTooltipIndex];if(it)openDrill("Rate: "+it.name,function(r){var v=pn(r[mp[it.field]]);return v!==null&&v>=it.mn&&v<=it.mx;},"interest_rate");}}}><CartesianGrid strokeDasharray="3 3" stroke={T.bd}/><XAxis dataKey="name" tick={{fill:T.td,fontSize:8}} axisLine={{stroke:T.bd}}/><YAxis tick={{fill:T.td,fontSize:8}} axisLine={{stroke:T.bd}} tickFormatter={function(v){return v.toFixed(0)+"%";}}/><Tooltip/><Bar dataKey="pct" name="% Bal" radius={[3,3,0,0]} cursor="pointer">{a.rateDist.map(function(e,i){return <Cell key={i} fill={PL[i%PL.length]}/>;})}</Bar></BarChart></ResponsiveContainer>)}
  </div>
  {a.has("loan_status")&&cc_("Status (click to drill)",Eye,<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{a.stat.map(function(s,i){return <div key={i} onClick={function(){openDrill("Status: "+s.name,function(r){return String(r[mp[s.field]]||"").trim()===s.name;},"loan_status");}} style={{flex:"1 1 90px",background:T.sf,border:"1px solid "+T.bd,borderRadius:6,padding:7,textAlign:"center",cursor:"pointer"}}><div style={{width:6,height:6,borderRadius:"50%",background:PL[i%PL.length],margin:"0 auto 2px"}}/><div style={{fontSize:14,fontWeight:700,fontFamily:"monospace"}}>{fP(s.pct)}</div><div style={{fontSize:8,color:T.tm}}>{s.name}</div><div style={{fontSize:7,color:T.ac}}>drill ↗</div></div>;})}</div>)}
</div>}

{/* ═══ CRACKING ═══ */}
{tab==="cracking"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <div><h2 style={{fontSize:15,fontWeight:700,margin:0}}>Tape Cracking</h2><p style={{fontSize:10,color:T.td,margin:"2px 0 0"}}>Click any metric or row to drill</p></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
    {mc_(AlertTriangle,"Gross Loss",fP(a.glr),a.glr>5?T.dg:a.glr>2?T.wn:T.ac,null,function(){openDrill("Charged Off / Default",function(r){return/charge|default|loss/i.test(String(r[mp.loan_status]||""));},"loan_status");})}
    {mc_(AlertTriangle,"Net Loss",fP(a.nlr),a.nlr>4?T.dg:T.ac,fC(a.nl))}
    {mc_(DollarSign,"Recoveries",fC(a.rec),T.bu)}
    {mc_(Activity,"30+ DPD",fP(a.dq30),a.dq30>5?T.dg:T.wn,null,function(){openDrill("30+ DPD",function(r){return/30|60|90|120|default|charge|bankrupt/i.test(String(r[mp.loan_status]||""));},"loan_status");})}
    {mc_(Activity,"60+ DPD",fP(a.dq60),a.dq60>3?T.dg:T.wn,null,function(){openDrill("60+ DPD",function(r){return/60|90|120|default|charge|bankrupt/i.test(String(r[mp.loan_status]||""));},"loan_status");})}
    {mc_(Activity,"90+ DPD",fP(a.dq90),T.dg,null,function(){openDrill("90+ DPD",function(r){return/90|120|default|charge|bankrupt/i.test(String(r[mp.loan_status]||""));},"loan_status");})}
    {mc_(Shield,"Pool Factor",fP(a.pf),T.bu)}
    {mc_(Shield,"WA Seasoning",Math.round(a.waM)+" mo",T.pu,null,function(){openDrill("All (by Seasoning)",function(){return true;},"months_on_book");})}
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
    {a.has("loan_status")&&cc_("Status (click rows)",Eye,renderStrat(a.stat,a.N,T.ac))}
    {a.vint.length>1&&cc_("Vintage (click rows)",Activity,renderStrat(a.vint.slice(0,12),a.N,T.bu))}
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
    {a.grad.length>1&&cc_("Grade",Shield,renderStrat(a.grad,a.N,T.wn))}
    {a.purp.length>1&&cc_("Purpose",FileText,renderStrat(a.purp,a.N,T.pu))}
  </div>
</div>}

{/* ═══ QUALITY ═══ */}
{tab==="quality"&&vl&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontSize:15,fontWeight:700,margin:0}}>Data Quality</h2>
  {function(){var g=vl.comp>98?"A":vl.comp>95?"B":vl.comp>90?"C":"D",gc={A:T.ac,B:T.bu,C:T.wn,D:T.dg}[g];return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
    <div style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:34,fontWeight:800,color:gc,fontFamily:"monospace"}}>{g}</div><div style={{fontSize:9,color:T.tm}}>Grade</div></div>
    <div style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,fontFamily:"monospace"}}>{vl.comp.toFixed(1)}%</div><div style={{fontSize:9,color:T.tm}}>Complete</div></div>
    <div style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:vl.mc>0?T.wn:T.ac,fontFamily:"monospace"}}>{fN(vl.mc)}</div><div style={{fontSize:9,color:T.tm}}>Missing</div></div>
    <div style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:vl.oor>0?T.dg:T.ac,fontFamily:"monospace"}}>{fN(vl.oor)}</div><div style={{fontSize:9,color:T.tm}}>Out of Range</div></div>
  </div>;}()}
  {cc_("Field Mapping",Database,<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:3}}>{Object.keys(STD).map(function(fk){var mapped=mp[fk];return <div key={fk} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 6px",background:T.sf,borderRadius:4,border:"1px solid "+T.bd,fontSize:9}}>{mapped?<CheckCircle size={9} color={T.ac}/>:<X size={9} color={T.td}/>}<span style={{color:T.tm,minWidth:70}}>{STD[fk].l}</span><ChevronRight size={7} color={T.td}/><span style={{color:mapped?T.tx:T.td,fontFamily:"monospace",fontSize:8}}>{mapped||"—"}</span></div>;})}</div>)}
</div>}

{/* ═══ STRATS ═══ */}
{tab==="strats"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontSize:15,fontWeight:700,margin:0}}>Stratifications</h2>
  <p style={{fontSize:10,color:T.td,margin:0}}>Click any row → drill into loans</p>
  {[{t:"FICO",d:a.ficoDist,s:a.has("fico_origination"),c:PL[0]},{t:"Rate",d:a.rateDist,s:a.has("interest_rate"),c:PL[1]},{t:"DTI",d:a.dtiDist,s:a.has("dti"),c:PL[2]},{t:"Term",d:a.termDist,s:a.has("original_term"),c:PL[3]},{t:"Purpose",d:a.purp,s:a.has("loan_purpose"),c:PL[4]},{t:"Channel",d:a.chan,s:a.has("origination_channel"),c:PL[5]},{t:"Inc Verif",d:a.veri,s:a.has("income_verification"),c:PL[6]},{t:"Housing",d:a.hous,s:a.has("housing_status"),c:PL[7]},{t:"Grade",d:a.grad,s:a.grad.length>1,c:PL[8]},{t:"Vintage",d:a.vint,s:a.vint.length>1,c:PL[9]}].filter(function(x){return x.s&&x.d.some(function(d){return d.count>0;});}).map(function(tbl){
    return cc_(tbl.t+" ↗",BarChart3,renderStrat(tbl.d,a.N,tbl.c));
  })}
</div>}

{/* ═══ CUSTOM STRATS ═══ */}
{tab==="custom"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div><h2 style={{fontSize:15,fontWeight:700,margin:0}}>Custom Stratifications</h2><p style={{fontSize:10,color:T.td,margin:"2px 0 0"}}>Build your own strat by column — numeric buckets or categorical grouping</p></div>
    <button onClick={function(){setCsEdit({name:"",col:"",type:"cat",buckets:[{l:"",mn:"",mx:""}]});}} style={{background:"linear-gradient(135deg,"+T.ac+","+T.bu+")",border:"none",borderRadius:7,padding:"7px 14px",color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Plus size={12}/> New Strat</button>
  </div>

  {/* Editor */}
  {csEdit&&<div style={{background:T.cd,border:"1px solid "+T.ac+"40",borderRadius:10,padding:16}}>
    <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>{csEdit.id?"Edit Strat":"New Custom Strat"}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>Name</div><input value={csEdit.name} onChange={function(e){setCsEdit(Object.assign({},csEdit,{name:e.target.value}));}} placeholder="My Strat" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"5px 8px",color:T.tx,fontSize:10,outline:"none"}}/></div>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>Column</div><select value={csEdit.col} onChange={function(e){setCsEdit(Object.assign({},csEdit,{col:e.target.value}));}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"5px 8px",color:T.tx,fontSize:10,cursor:"pointer"}}><option value="">Select column...</option>{hdrs.map(function(h){return <option key={h} value={h}>{h}</option>;})}</select></div>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>Type</div><div style={{display:"flex",gap:4}}><button onClick={function(){setCsEdit(Object.assign({},csEdit,{type:"cat"}));}} style={{flex:1,background:csEdit.type==="cat"?T.ad:T.sf,border:"1px solid "+(csEdit.type==="cat"?T.ac+"60":T.bd),borderRadius:4,padding:"5px 6px",color:csEdit.type==="cat"?T.ac:T.tm,fontSize:9,cursor:"pointer"}}>Categorical</button><button onClick={function(){setCsEdit(Object.assign({},csEdit,{type:"num",buckets:csEdit.buckets&&csEdit.buckets.length?csEdit.buckets:[{l:"",mn:"",mx:""}]}));}} style={{flex:1,background:csEdit.type==="num"?T.ad:T.sf,border:"1px solid "+(csEdit.type==="num"?T.ac+"60":T.bd),borderRadius:4,padding:"5px 6px",color:csEdit.type==="num"?T.ac:T.tm,fontSize:9,cursor:"pointer"}}>Numeric Buckets</button></div></div>
    </div>
    {/* Numeric bucket editor */}
    {csEdit.type==="num"&&<div style={{marginBottom:10}}>
      <div style={{fontSize:9,color:T.tm,marginBottom:4}}>Buckets (label, min, max)</div>
      {csEdit.buckets.map(function(bk,bi){return <div key={bi} style={{display:"flex",gap:4,marginBottom:3,alignItems:"center"}}>
        <input value={bk.l} onChange={function(e){var nb=[].concat(csEdit.buckets);nb[bi]=Object.assign({},nb[bi],{l:e.target.value});setCsEdit(Object.assign({},csEdit,{buckets:nb}));}} placeholder="Label" style={{flex:2,background:T.sf,border:"1px solid "+T.bd,borderRadius:3,padding:"3px 6px",color:T.tx,fontSize:9,outline:"none"}}/>
        <input value={bk.mn} onChange={function(e){var nb=[].concat(csEdit.buckets);nb[bi]=Object.assign({},nb[bi],{mn:e.target.value});setCsEdit(Object.assign({},csEdit,{buckets:nb}));}} placeholder="Min" style={{flex:1,background:T.sf,border:"1px solid "+T.bd,borderRadius:3,padding:"3px 6px",color:T.tx,fontSize:9,outline:"none"}}/>
        <input value={bk.mx} onChange={function(e){var nb=[].concat(csEdit.buckets);nb[bi]=Object.assign({},nb[bi],{mx:e.target.value});setCsEdit(Object.assign({},csEdit,{buckets:nb}));}} placeholder="Max" style={{flex:1,background:T.sf,border:"1px solid "+T.bd,borderRadius:3,padding:"3px 6px",color:T.tx,fontSize:9,outline:"none"}}/>
        <button onClick={function(){var nb=csEdit.buckets.filter(function(_,i){return i!==bi;});setCsEdit(Object.assign({},csEdit,{buckets:nb}));}} style={{background:"none",border:"none",color:T.dg,cursor:"pointer",padding:2}}><Trash2 size={10}/></button>
      </div>;})}
      <button onClick={function(){setCsEdit(Object.assign({},csEdit,{buckets:csEdit.buckets.concat([{l:"",mn:"",mx:""}])}));}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 10px",color:T.ac,fontSize:8,cursor:"pointer",display:"flex",alignItems:"center",gap:3,marginTop:4}}><Plus size={9}/> Add Bucket</button>
    </div>}
    {csEdit.type==="cat"&&csEdit.col&&<div style={{fontSize:9,color:T.tm,marginBottom:8}}>Will group by unique values in "{csEdit.col}"</div>}
    {/* Preview sample values */}
    {csEdit.col&&<div style={{fontSize:8,color:T.td,marginBottom:8}}>Sample: {data.slice(0,8).map(function(r){return r[csEdit.col];}).filter(function(v){return v!=null;}).join(", ")}</div>}
    <div style={{display:"flex",gap:6}}>
      <button onClick={function(){
        if(!csEdit.name||!csEdit.col)return;
        var ns={id:csEdit.id||Date.now(),name:csEdit.name,col:csEdit.col,type:csEdit.type,buckets:csEdit.type==="num"?csEdit.buckets.filter(function(b){return b.l&&b.mn!==""&&b.mx!=="";}).map(function(b){return{l:b.l,mn:parseFloat(b.mn),mx:parseFloat(b.mx)};}):[]};
        if(csEdit.id){setCustStrats(custStrats.map(function(s){return s.id===csEdit.id?ns:s;}));}
        else{setCustStrats(custStrats.concat([ns]));}
        setCsEdit(null);
      }} style={{background:T.ac,border:"none",borderRadius:5,padding:"6px 14px",color:"#000",fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Play size={10}/> {csEdit.id?"Update":"Create"}</button>
      <button onClick={function(){setCsEdit(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"6px 14px",color:T.tm,fontSize:10,cursor:"pointer"}}>Cancel</button>
    </div>
  </div>}

  {/* Rendered custom strats */}
  {custStrats.length===0&&!csEdit&&<div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:32,textAlign:"center"}}><BarChart3 size={28} color={T.td} style={{marginBottom:8}}/><div style={{fontSize:12,color:T.tm}}>No custom strats yet</div><div style={{fontSize:10,color:T.td,marginTop:3}}>Click "New Strat" to build one — pick any column and create numeric buckets or categorical groupings</div></div>}
  {custStrats.map(function(cs){
    var results;
    if(cs.type==="num"){
      results=cs.buckets.map(function(b){
        var m=data.filter(function(r){var v=pn(r[cs.col]);return v!==null&&v>=b.mn&&v<=b.mx;});
        var bl=_.sum(m.map(function(r){return pn(r[mp.current_balance])||0;}));
        return{name:b.l,count:m.length,balance:bl,pct:a.tb>0?(bl/a.tb)*100:0,_filterFn:function(r){var v=pn(r[cs.col]);return v!==null&&v>=b.mn&&v<=b.mx;},_col:cs.col};
      });
    } else {
      var groups={};data.forEach(function(r){var k=String(r[cs.col]||"").trim()||"Unknown";if(!groups[k])groups[k]={c:0,b:0};groups[k].c++;groups[k].b+=pn(r[mp.current_balance])||0;});
      results=Object.entries(groups).map(function(e){return{name:e[0],count:e[1].c,balance:e[1].b,pct:a.tb>0?(e[1].b/a.tb)*100:0,_filterFn:function(r){return String(r[cs.col]||"").trim()===e[0]||(e[0]==="Unknown"&&!String(r[cs.col]||"").trim());},_col:cs.col};}).sort(function(a2,b2){return b2.balance-a2.balance;});
    }
    return <div key={cs.id} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><BarChart3 size={12} color={T.ac}/><span style={{fontSize:12,fontWeight:600}}>{cs.name}</span><span style={{fontSize:8,color:T.td,background:T.sf,padding:"1px 6px",borderRadius:3}}>{cs.type==="num"?"numeric":"categorical"} · {cs.col}</span></div>
        <div style={{display:"flex",gap:4}}>
          <button onClick={function(){downloadCSV(data.map(function(r){var bkt=results.find(function(b){return b._filterFn(r);});return Object.assign({},r,{"__strat_bucket":bkt?bkt.name:"Other"});}),["__strat_bucket"].concat(hdrs),cs.name+"_strat.csv");}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"2px 8px",color:T.ac,fontSize:8,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><Download size={8}/> CSV</button>
          <button onClick={function(){setCsEdit({id:cs.id,name:cs.name,col:cs.col,type:cs.type,buckets:cs.type==="num"?cs.buckets.map(function(b){return{l:b.l,mn:String(b.mn),mx:String(b.mx)};}):[]});}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"2px 8px",color:T.tm,fontSize:8,cursor:"pointer"}}>Edit</button>
          <button onClick={function(){setCustStrats(custStrats.filter(function(s){return s.id!==cs.id;}));}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"2px 8px",color:T.dg,fontSize:8,cursor:"pointer"}}><Trash2 size={8}/></button>
        </div>
      </div>
      {/* Chart */}
      {results.length>0&&results.length<=20&&<div style={{marginBottom:8}}><ResponsiveContainer width="100%" height={140}><BarChart data={results} barSize={16} onClick={function(d){if(d&&d.activeTooltipIndex!=null){var it=results[d.activeTooltipIndex];if(it)openDrill(cs.name+": "+it.name,it._filterFn,null);}}}><CartesianGrid strokeDasharray="3 3" stroke={T.bd}/><XAxis dataKey="name" tick={{fill:T.td,fontSize:7}} axisLine={{stroke:T.bd}}/><YAxis tick={{fill:T.td,fontSize:7}} axisLine={{stroke:T.bd}} tickFormatter={function(v){return v.toFixed(0)+"%";}}/><Tooltip/><Bar dataKey="pct" name="% Bal" radius={[3,3,0,0]} cursor="pointer">{results.map(function(e,i){return <Cell key={i} fill={PL[i%PL.length]}/>;})}</Bar></BarChart></ResponsiveContainer></div>}
      {/* Table */}
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}><thead><tr>{["Bucket","#","Balance","% Bal",""].map(function(h){return <th key={h} style={{textAlign:"left",padding:"5px 8px",borderBottom:"1px solid "+T.bd,color:T.tm,fontWeight:600,fontSize:8,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead><tbody>{results.map(function(r,i){return <tr key={i} style={{borderBottom:"1px solid "+T.bd,cursor:"pointer"}} onClick={function(){openDrill(cs.name+": "+r.name,r._filterFn,null);}} onMouseEnter={function(e){e.currentTarget.style.background=T.sf;}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
        <td style={{padding:"5px 8px",fontWeight:500}}>{r.name}</td>
        <td style={{padding:"5px 8px",fontFamily:"monospace"}}>{fN(r.count)}</td>
        <td style={{padding:"5px 8px",fontFamily:"monospace"}}>{fC(r.balance)}</td>
        <td style={{padding:"5px 8px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:40,height:3,background:T.bd,borderRadius:2}}><div style={{width:Math.min(r.pct,100)+"%",height:"100%",background:PL[i%PL.length],borderRadius:2}}/></div><span style={{fontFamily:"monospace",fontSize:8}}>{fP(r.pct)}</span></div></td>
        <td style={{padding:"5px 8px"}}><ExternalLink size={9} color={T.td}/></td>
      </tr>;})}</tbody></table>
    </div>;
  })}
</div>}

{/* ═══ CHARTS & REGRESSION ═══ */}
{tab==="charts"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <div><h2 style={{fontSize:15,fontWeight:700,margin:0}}>Charts & Regression</h2><p style={{fontSize:10,color:T.td,margin:"2px 0 0"}}>Pick 2-3 numeric columns for scatter plot with OLS regression</p></div>

  {/* Column pickers */}
  <div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:14}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>X Axis *</div><select value={chX} onChange={function(e){setChX(e.target.value);}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"5px 6px",color:T.tx,fontSize:9,cursor:"pointer"}}><option value="">Select...</option>{hdrs.map(function(h){return <option key={h} value={h}>{h}</option>;})}</select></div>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>Y Axis *</div><select value={chY} onChange={function(e){setChY(e.target.value);}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"5px 6px",color:T.tx,fontSize:9,cursor:"pointer"}}><option value="">Select...</option>{hdrs.map(function(h){return <option key={h} value={h}>{h}</option>;})}</select></div>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>Z / 2nd Predictor</div><select value={chZ} onChange={function(e){setChZ(e.target.value);}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"5px 6px",color:T.tx,fontSize:9,cursor:"pointer"}}><option value="">(none)</option>{hdrs.map(function(h){return <option key={h} value={h}>{h}</option>;})}</select></div>
      <div><div style={{fontSize:8,color:T.tm,marginBottom:3}}>Color By (categorical)</div><select value={chColor} onChange={function(e){setChColor(e.target.value);}} style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"5px 6px",color:T.tx,fontSize:9,cursor:"pointer"}}><option value="">(none)</option>{hdrs.map(function(h){return <option key={h} value={h}>{h}</option>;})}</select></div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <label style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:T.tm,cursor:"pointer"}}><input type="checkbox" checked={chReg} onChange={function(e){setChReg(e.target.checked);}} style={{accentColor:T.ac}}/> Show Regression Line</label>
      {chX&&chY&&<button onClick={function(){setChSaved(chSaved.concat([{x:chX,y:chY,z:chZ,color:chColor,reg:chReg,id:Date.now()}]));}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 10px",color:T.ac,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><Plus size={9}/> Save Chart</button>}
    </div>
  </div>

  {/* Live chart preview */}
  {chX&&chY&&function(){
    var pts=[];var colorMap={};var colorIdx=0;
    data.forEach(function(r){
      var xv=pn(r[chX]),yv=pn(r[chY]);
      if(xv===null||yv===null)return;
      var pt={x:xv,y:yv};
      if(chZ){var zv=pn(r[chZ]);if(zv===null)return;pt.z=zv;}
      if(chColor){var cv=String(r[chColor]||"").trim()||"Other";pt.color=cv;if(!colorMap[cv]){colorMap[cv]=PL[colorIdx%PL.length];colorIdx++;}}
      pts.push(pt);
    });
    if(pts.length<3)return <div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:20,textAlign:"center",color:T.td,fontSize:11}}>Need at least 3 valid numeric data points. Check that selected columns contain numbers.</div>;

    var reg2=chReg?calcRegression(pts):null;
    var reg3=(chReg&&chZ)?calcMultiReg(pts.map(function(p){return{x1:p.x,x2:p.z,y:p.y};})):null;
    var colorGroups=chColor?Object.keys(colorMap):null;
    // Sample down for performance
    var display=pts.length>2000?pts.filter(function(_,i){return i%Math.ceil(pts.length/2000)===0;}):pts;

    return <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:14}}>
        <div style={{fontSize:11,fontWeight:600,marginBottom:8,color:T.tx}}>{chY} vs {chX}{chZ?" + "+chZ:""} ({fN(pts.length)} points){chColor?" · colored by "+chColor:""}</div>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{top:10,right:20,bottom:30,left:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.bd}/>
            <XAxis dataKey="x" name={chX} tick={{fill:T.td,fontSize:8}} axisLine={{stroke:T.bd}} label={{value:chX,position:"bottom",fill:T.tm,fontSize:9,offset:0}}/>
            <YAxis dataKey="y" name={chY} tick={{fill:T.td,fontSize:8}} axisLine={{stroke:T.bd}} label={{value:chY,angle:-90,position:"insideLeft",fill:T.tm,fontSize:9}}/>
            <Tooltip cursor={{strokeDasharray:"3 3"}} contentStyle={{background:"#1A1F28",border:"1px solid "+T.bl,borderRadius:6,fontSize:9}}/>
            {colorGroups?colorGroups.map(function(grp){return <Scatter key={grp} name={grp} data={display.filter(function(p){return p.color===grp;})} fill={colorMap[grp]} fillOpacity={0.6} r={3}/>;}):<Scatter name="data" data={display} fill={T.ac} fillOpacity={0.5} r={3}/>}
            {chReg&&reg2&&<Line data={reg2.line} dataKey="y" stroke={T.dg} strokeWidth={2} dot={false} name="OLS fit" strokeDasharray="6 3" type="linear" legendType="line"/>}
            <Legend wrapperStyle={{fontSize:8}}/>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Regression stats */}
      {chReg&&<div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:14}}>
        <div style={{fontSize:11,fontWeight:600,marginBottom:8}}>Regression Results</div>
        {reg2&&!chZ&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
          <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Equation</div><div style={{fontSize:10,fontFamily:"monospace",color:T.tx}}>y = {reg2.slope.toFixed(4)}x {reg2.intercept>=0?"+":""} {reg2.intercept.toFixed(4)}</div></div>
          <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>R²</div><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:reg2.r2>0.7?T.ac:reg2.r2>0.3?T.wn:T.dg}}>{reg2.r2.toFixed(4)}</div></div>
          <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Correlation (r)</div><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:Math.abs(reg2.r)>0.7?T.ac:Math.abs(reg2.r)>0.3?T.wn:T.dg}}>{reg2.r.toFixed(4)}</div></div>
          <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Slope</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace",color:T.tx}}>{reg2.slope.toFixed(6)}</div></div>
          <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Intercept</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace",color:T.tx}}>{reg2.intercept.toFixed(4)}</div></div>
          <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>N</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace",color:T.tx}}>{fN(reg2.n)}</div></div>
        </div>}
        {reg3&&chZ&&<div>
          <div style={{fontSize:10,color:T.tm,marginBottom:6}}>Multiple Regression: {chY} = β₀ + β₁·{chX} + β₂·{chZ}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
            <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Equation</div><div style={{fontSize:9,fontFamily:"monospace",color:T.tx}}>y = {reg3.b0.toFixed(3)} + {reg3.b1.toFixed(4)}·x₁ + {reg3.b2.toFixed(4)}·x₂</div></div>
            <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>R²</div><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:reg3.r2>0.7?T.ac:reg3.r2>0.3?T.wn:T.dg}}>{reg3.r2.toFixed(4)}</div></div>
            <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>Adj R²</div><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:reg3.adjR2>0.7?T.ac:reg3.adjR2>0.3?T.wn:T.dg}}>{reg3.adjR2.toFixed(4)}</div></div>
            <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>β₁ ({chX})</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace",color:T.tx}}>{reg3.b1.toFixed(6)}</div></div>
            <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>β₂ ({chZ})</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace",color:T.tx}}>{reg3.b2.toFixed(6)}</div></div>
            <div style={{background:T.sf,borderRadius:6,padding:10,textAlign:"center"}}><div style={{fontSize:7,color:T.tm,marginBottom:2}}>N</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace",color:T.tx}}>{fN(reg3.n)}</div></div>
          </div>
        </div>}
        {!chZ&&reg2&&<div style={{fontSize:9,color:T.td,marginTop:6}}>Interpretation: {Math.abs(reg2.r)>0.7?"Strong":Math.abs(reg2.r)>0.4?"Moderate":"Weak"} {reg2.r>0?"positive":"negative"} correlation. For every 1-unit increase in {chX}, {chY} {reg2.slope>0?"increases":"decreases"} by {Math.abs(reg2.slope).toFixed(4)} on average.</div>}
      </div>}
    </div>;
  }()}

  {/* Saved charts */}
  {chSaved.map(function(ch){
    var pts=[];data.forEach(function(r){var xv=pn(r[ch.x]),yv=pn(r[ch.y]);if(xv===null||yv===null)return;var pt={x:xv,y:yv};if(ch.z){var zv=pn(r[ch.z]);if(zv===null)return;pt.z=zv;}pts.push(pt);});
    var reg=ch.reg?calcRegression(pts):null;
    var display=pts.length>1500?pts.filter(function(_,i){return i%Math.ceil(pts.length/1500)===0;}):pts;
    return <div key={ch.id} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:600}}>{ch.y} vs {ch.x}{ch.z?" + "+ch.z:""}{reg?" · R²="+reg.r2.toFixed(3):""}</div>
        <div style={{display:"flex",gap:4}}>
          <button onClick={function(){var csv=pts.map(function(p){return[p.x,p.y,p.z||""].join(",");});var hdr=[ch.x,ch.y,ch.z||""].filter(Boolean).join(",");var blob=new Blob([hdr+"\n"+csv.join("\n")],{type:"text/csv"});var u=URL.createObjectURL(blob);var a2=document.createElement("a");a2.href=u;a2.download="chart_data.csv";document.body.appendChild(a2);a2.click();document.body.removeChild(a2);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"2px 8px",color:T.ac,fontSize:8,cursor:"pointer"}}><Download size={8}/></button>
          <button onClick={function(){setChSaved(chSaved.filter(function(s){return s.id!==ch.id;}));}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"2px 8px",color:T.dg,fontSize:8,cursor:"pointer"}}><Trash2 size={8}/></button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart><CartesianGrid strokeDasharray="3 3" stroke={T.bd}/><XAxis dataKey="x" tick={{fill:T.td,fontSize:7}} axisLine={{stroke:T.bd}}/><YAxis dataKey="y" tick={{fill:T.td,fontSize:7}} axisLine={{stroke:T.bd}}/><Tooltip contentStyle={{background:"#1A1F28",border:"1px solid "+T.bl,fontSize:8}}/><Scatter data={display} fill={T.ac} fillOpacity={0.4} r={2}/>{reg&&<Line data={reg.line} dataKey="y" stroke={T.dg} strokeWidth={2} dot={false} strokeDasharray="6 3" type="linear"/>}</ScatterChart>
      </ResponsiveContainer>
    </div>;
  })}

  {!chX&&!chY&&chSaved.length===0&&<div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:32,textAlign:"center"}}><TrendingUp size={28} color={T.td} style={{marginBottom:8}}/><div style={{fontSize:12,color:T.tm}}>Select X and Y columns above to start</div><div style={{fontSize:10,color:T.td,marginTop:3}}>Supports scatter plots, OLS simple & multiple regression, color-by grouping</div></div>}
</div>}

{/* ═══ CONCENTRATION ═══ */}
{tab==="concentration"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontSize:15,fontWeight:700,margin:0}}>Concentration</h2>
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
    {mc_(AlertTriangle,"Top State",fP(a.tsc),a.tsc>25?T.dg:T.wn,a.geo.length>0?a.geo[0].name:"N/A",a.geo.length>0?function(){openDrill("State: "+a.geo[0].name,function(r){return String(r[mp.state]||"").trim()===a.geo[0].name;},"state");}:undefined)}
    {mc_(Shield,"HHI",a.hhi.toFixed(4),a.hhi>0.25?T.dg:a.hhi>0.15?T.wn:T.ac,a.hhi>0.25?"Concentrated":a.hhi>0.15?"Moderate":"Diversified")}
    {mc_(Database,"States",String(a.geo.length),T.bu)}
  </div>
  {a.has("state")&&cc_("Geographic (click rows)",Layers,renderStrat(a.geo,a.N,T.ac))}
</div>}

{/* ═══ RISK ═══ */}
{tab==="risk"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontSize:15,fontWeight:700,margin:0}}>Risk Summary</h2>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:8}}>
    {[{l:"Credit",ch:[{n:"WA FICO",v:a.has("fico_origination")?fS(a.waFO):"N/A",s:!a.has("fico_origination")?"n":a.waFO>=700?"p":a.waFO>=660?"w":"f"},{n:"WA DTI",v:a.has("dti")?fP(a.waD):"N/A",s:!a.has("dti")?"n":a.waD<=36?"p":a.waD<=43?"w":"f"}]},{l:"Performance",ch:[{n:"30+ DPD",v:fP(a.dq30),s:a.dq30<2?"p":a.dq30<5?"w":"f"},{n:"90+ DPD",v:fP(a.dq90),s:a.dq90<1?"p":a.dq90<3?"w":"f"},{n:"Gross Loss",v:fP(a.glr),s:a.glr<2?"p":a.glr<5?"w":"f"}]},{l:"Concentration",ch:[{n:"Top State",v:a.geo.length>0?a.geo[0].name+" "+fP(a.tsc):"N/A",s:a.tsc<=15?"p":a.tsc<=25?"w":"f"},{n:"HHI",v:a.hhi.toFixed(4),s:a.hhi<=0.15?"p":a.hhi<=0.25?"w":"f"}]},{l:"Data",ch:[{n:"Complete",v:vl?fP(vl.comp):"N/A",s:!vl?"n":vl.comp>=98?"p":vl.comp>=95?"w":"f"},{n:"Mapped",v:mCt+"/"+tF,s:mCt>=25?"p":mCt>=15?"w":"f"}]}].map(function(sec,si){
      return <div key={si} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:9,padding:12}}><div style={{fontSize:11,fontWeight:700,marginBottom:8}}>{sec.l}</div>{sec.ch.map(function(c,ci){var col=c.s==="p"?T.ac:c.s==="w"?T.wn:c.s==="f"?T.dg:T.td;return <div key={ci} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderTop:ci>0?"1px solid "+T.bd:"none"}}><span style={{fontSize:10}}>{c.n}</span><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,fontWeight:600,fontFamily:"monospace",color:col}}>{c.v}</span><div style={{width:6,height:6,borderRadius:"50%",background:col}}/></div></div>;})}</div>;
    })}
  </div>
</div>}

{/* ═══ ADMIN / TEMPLATES ═══ */}
{tab==="admin"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
  <div><h2 style={{fontSize:15,fontWeight:700,margin:0}}>Admin / Templates</h2><p style={{fontSize:10,color:T.td,margin:"2px 0 0"}}>Manage standard fields and originator mapping templates</p></div>
  {/* Sub-tabs */}
  <div style={{display:"flex",gap:4}}>
    {[{id:"fields",l:"Standard Fields"},{id:"tpls",l:"Originator Templates"}].map(function(st){return <button key={st.id} onClick={function(){setAdminSub(st.id);}} style={{background:adminSub===st.id?T.ad:T.sf,border:"1px solid "+(adminSub===st.id?T.ac+"60":T.bd),borderRadius:5,padding:"6px 14px",color:adminSub===st.id?T.ac:T.tm,fontSize:10,fontWeight:500,cursor:"pointer"}}>{st.l}</button>;})}
  </div>

  {/* ── FIELDS ADMIN ── */}
  {adminSub==="fields"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:11,fontWeight:600}}>{Object.keys(STD).length} built-in + {custFields.length} custom fields</span>
    <button onClick={function(){setCfEdit({key:"",label:"",patternsStr:""});}} style={{background:T.ac,border:"none",borderRadius:6,padding:"6px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Plus size={10}/> Add Custom Field</button></div>

    {/* Custom field editor */}
    {cfEdit&&<div style={{background:T.cd,border:"1px solid "+T.ac+"40",borderRadius:8,padding:14}}>
      <div style={{fontSize:11,fontWeight:600,marginBottom:8}}>{cfEdit.existing?"Edit Field":"New Custom Field"}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:8,marginBottom:10}}>
        <div><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Field Key</div><input value={cfEdit.key} onChange={function(e){setCfEdit(Object.assign({},cfEdit,{key:e.target.value.replace(/[^a-z0-9_]/g,"")}));}} placeholder="my_field_key" disabled={cfEdit.existing} style={{width:"100%",background:cfEdit.existing?T.bd:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
        <div><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Display Label</div><input value={cfEdit.label} onChange={function(e){setCfEdit(Object.assign({},cfEdit,{label:e.target.value}));}} placeholder="My Field" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
        <div><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Alternate Column Names (comma-separated)</div><input value={cfEdit.patternsStr} onChange={function(e){setCfEdit(Object.assign({},cfEdit,{patternsStr:e.target.value}));}} placeholder="prepay speed, prepayment cpr, smm rate" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
      </div>
      <div style={{fontSize:8,color:T.td,marginBottom:8}}>List the different column names originators might use for this field. Matching is fuzzy — "prepay speed" will match "Prepay_Speed", "PrepaySpeed", "PREPAY SPEED", etc. You can also use regex patterns like "cpr|prepay.?speed" for advanced matching.</div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={function(){
          if(!cfEdit.key||!cfEdit.label)return;
          var patterns=cfEdit.patternsStr.split(",").map(function(s){return s.trim();}).filter(Boolean);
          var nf={key:cfEdit.key,label:cfEdit.label,patterns:patterns};
          if(cfEdit.existing){setCustFields(custFields.map(function(f){return f.key===cfEdit.key?nf:f;}));}
          else{if(STD[cfEdit.key]||custFields.some(function(f){return f.key===cfEdit.key;})){return;}setCustFields(custFields.concat([nf]));}
          setCfEdit(null);
        }} style={{background:T.ac,border:"none",borderRadius:5,padding:"5px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer"}}>{cfEdit.existing?"Update":"Add Field"}</button>
        <button onClick={function(){setCfEdit(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"5px 12px",color:T.tm,fontSize:9,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>}

    {/* Built-in fields table */}
    <div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:8,padding:12}}>
      <div style={{fontSize:10,fontWeight:600,marginBottom:8,color:T.tm}}>Built-in Fields ({Object.keys(STD).length})</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:3,maxHeight:200,overflow:"auto"}}>
        {Object.keys(STD).map(function(fk){return <div key={fk} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 6px",background:T.sf,borderRadius:4,fontSize:8}}>
          <span style={{color:T.ac,fontFamily:"monospace",minWidth:90}}>{fk}</span>
          <span style={{color:T.tx}}>{STD[fk].l}</span>
          <span style={{color:T.td,fontSize:7,marginLeft:"auto"}}>{STD[fk].p.length}p</span>
        </div>;})}
      </div>
    </div>

    {/* Custom fields table */}
    {custFields.length>0&&<div style={{background:T.cd,border:"1px solid "+T.ac+"30",borderRadius:8,padding:12}}>
      <div style={{fontSize:10,fontWeight:600,marginBottom:8,color:T.ac}}>Custom Fields ({custFields.length}) ★</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:9}}>
        <thead><tr>{["Key","Label","Patterns",""].map(function(h){return <th key={h} style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid "+T.bd,color:T.tm,fontSize:8}}>{h}</th>;})}</tr></thead>
        <tbody>{custFields.map(function(cf){return <tr key={cf.key} style={{borderBottom:"1px solid "+T.bd}}>
          <td style={{padding:"4px 8px",fontFamily:"monospace",color:T.ac}}>{cf.key}</td>
          <td style={{padding:"4px 8px"}}>{cf.label}</td>
          <td style={{padding:"4px 8px",color:T.td,fontSize:8}}>{cf.patterns.join(", ")}</td>
          <td style={{padding:"4px 8px"}}>
            <div style={{display:"flex",gap:3}}>
              <button onClick={function(){setCfEdit({key:cf.key,label:cf.label,patternsStr:cf.patterns.join(", "),existing:true});}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:3,padding:"1px 6px",color:T.tm,fontSize:7,cursor:"pointer"}}>Edit</button>
              <button onClick={function(){setCustFields(custFields.filter(function(f){return f.key!==cf.key;}));}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:3,padding:"1px 6px",color:T.dg,fontSize:7,cursor:"pointer"}}>Del</button>
            </div>
          </td>
        </tr>;})}</tbody>
      </table>
    </div>}
  </div>}

  {/* ── TEMPLATES ADMIN ── */}
  {adminSub==="tpls"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:11,fontWeight:600}}>{templates.length} originator templates</span>
    <button onClick={function(){setTplEdit({name:"",originator:""});}} style={{background:T.ac,border:"none",borderRadius:6,padding:"6px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Plus size={10}/> Save Current Mapping</button></div>

    {/* Save template form */}
    {tplEdit&&<div style={{background:T.cd,border:"1px solid "+T.ac+"40",borderRadius:8,padding:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Template Name *</div><input value={tplEdit.name} onChange={function(e){setTplEdit(Object.assign({},tplEdit,{name:e.target.value}));}} placeholder="LendingClub v2" style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
        <div><div style={{fontSize:8,color:T.tm,marginBottom:2}}>Originator Name</div><input value={tplEdit.originator} onChange={function(e){setTplEdit(Object.assign({},tplEdit,{originator:e.target.value}));}} placeholder="LendingClub, Prosper, SoFi..." style={{width:"100%",background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 8px",color:T.tx,fontSize:9,outline:"none"}}/></div>
      </div>
      <div style={{fontSize:8,color:T.td,marginBottom:8}}>Saves current mapping ({Object.keys(mp).length} fields mapped) as a reusable template. Load it from the Column Mapping tab dropdown.</div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={function(){if(!tplEdit.name)return;setTemplates(templates.concat([{id:Date.now(),name:tplEdit.name,originator:tplEdit.originator,mapping:cleanMp()}]));setTplEdit(null);}} style={{background:T.ac,border:"none",borderRadius:5,padding:"5px 12px",color:"#000",fontSize:9,fontWeight:600,cursor:"pointer"}}>Save Template</button>
        <button onClick={function(){setTplEdit(null);}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:5,padding:"5px 12px",color:T.tm,fontSize:9,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>}

    {templates.length===0&&!tplEdit&&<div style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:10,padding:28,textAlign:"center"}}><FileText size={24} color={T.td} style={{marginBottom:6}}/><div style={{fontSize:11,color:T.tm}}>No templates saved yet</div><div style={{fontSize:9,color:T.td,marginTop:3}}>Map columns on a tape, then save the mapping as a template for that originator. Next time you load a tape from the same originator, apply the template in one click.</div></div>}

    {/* Templates list */}
    {templates.map(function(tpl){
      var mapped=Object.keys(tpl.mapping).length;
      var originators=templates.map(function(t){return t.originator;}).filter(function(v,i,a){return v&&a.indexOf(v)===i;});
      return <div key={tpl.id} style={{background:T.cd,border:"1px solid "+T.bd,borderRadius:8,padding:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{tpl.name}</div>{tpl.originator&&<div style={{fontSize:9,color:T.pu,marginTop:1}}>Originator: {tpl.originator}</div>}</div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={function(){setMp(Object.assign({},tpl.mapping));if(data)rerun(data,tpl.mapping);setTab("mapping");}} style={{background:T.ac+"20",border:"1px solid "+T.ac+"50",borderRadius:4,padding:"3px 10px",color:T.ac,fontSize:8,cursor:"pointer"}}>Apply</button>
            <button onClick={function(){
              var json=JSON.stringify({name:tpl.name,originator:tpl.originator,mapping:tpl.mapping},null,2);
              var blob=new Blob([json],{type:"application/json"});var u=URL.createObjectURL(blob);var a2=document.createElement("a");a2.href=u;a2.download=(tpl.name||"template")+".json";document.body.appendChild(a2);a2.click();document.body.removeChild(a2);
            }} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 10px",color:T.tm,fontSize:8,cursor:"pointer"}}><Download size={8}/> Export</button>
            <button onClick={function(){setTemplates(templates.filter(function(t){return t.id!==tpl.id;}));}} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 10px",color:T.dg,fontSize:8,cursor:"pointer"}}><Trash2 size={8}/></button>
          </div>
        </div>
        <div style={{fontSize:9,color:T.tm,marginBottom:6}}>{mapped} fields mapped</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
          {Object.entries(tpl.mapping).map(function(e){return <div key={e[0]} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:3,padding:"1px 6px",fontSize:7,color:T.td}}><span style={{color:T.ac}}>{e[0]}</span> → <span style={{color:T.tx}}>{e[1]}</span></div>;})}
        </div>
      </div>;
    })}

    {/* Import template */}
    {templates.length>0&&<div style={{borderTop:"1px solid "+T.bd,paddingTop:10}}>
      <div style={{fontSize:9,color:T.tm,marginBottom:4}}>Originators: {templates.map(function(t){return t.originator;}).filter(function(v,i,a){return v&&a.indexOf(v)===i;}).join(", ")||"(none set)"}</div>
    </div>}
  </div>}
</div>}

{/* ═══ RAW DATA ═══ */}
{tab==="data"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><h2 style={{fontSize:15,fontWeight:700,margin:0}}>Raw Data</h2><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{position:"relative"}}><Search size={10} color={T.td} style={{position:"absolute",left:6,top:6}}/><input value={search} onChange={function(e){setSearch(e.target.value);setPg(0);}} placeholder="Search..." style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"4px 7px 4px 22px",color:T.tx,fontSize:9,width:140,outline:"none"}}/></div><span style={{fontSize:8,color:T.tm}}>{fN(fd.length)}</span></div></div>
  <div style={{overflow:"auto",background:T.cd,border:"1px solid "+T.bd,borderRadius:9,maxHeight:380}}><table style={{width:"max-content",minWidth:"100%",borderCollapse:"collapse",fontSize:9}}><thead><tr>{hdrs.map(function(h){return <th key={h} onClick={function(){if(sortC===h)setSortD(sortD==="asc"?"desc":"asc");else{setSortC(h);setSortD("asc");}}} style={{textAlign:"left",padding:"5px 7px",borderBottom:"1px solid "+T.bd,color:sortC===h?T.ac:T.tm,fontWeight:600,fontSize:8,cursor:"pointer",whiteSpace:"nowrap",position:"sticky",top:0,background:T.cd,minWidth:65}}>{h}{sortC===h?(sortD==="asc"?" ↑":" ↓"):""}</th>;})}</tr></thead><tbody>{pagedD.map(function(row,i){return <tr key={i} style={{borderBottom:"1px solid "+T.bd}}>{hdrs.map(function(h){return <td key={h} style={{padding:"4px 7px",whiteSpace:"nowrap",fontFamily:typeof row[h]==="number"?"monospace":"inherit"}}>{String(row[h]!=null?row[h]:"")}</td>;})}</tr>;})}</tbody></table></div>
  {totPg>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><button onClick={function(){setPg(Math.max(0,pg-1));}} disabled={pg===0} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 8px",color:pg===0?T.td:T.tx,fontSize:9,cursor:"pointer"}}>Prev</button><span style={{fontSize:9,color:T.tm}}>{pg+1}/{totPg}</span><button onClick={function(){setPg(Math.min(totPg-1,pg+1));}} disabled={pg>=totPg-1} style={{background:T.sf,border:"1px solid "+T.bd,borderRadius:4,padding:"3px 8px",color:pg>=totPg-1?T.td:T.tx,fontSize:9,cursor:"pointer"}}>Next</button></div>}
</div>}

        </main>
      </div>
    </div>
  );
}
