/**
 * Loan Tape Analyzer — Core Logic Module
 * 
 * Extracted from App.jsx so functions can be imported in tests.
 * App.jsx also contains these inline — this file is the testable mirror.
 */
import _ from "lodash";

// ═══ STANDARD FIELDS ═══
export var STD={loan_id:{l:"Loan ID",p:[/loan.?id/i,/account.?(id|num|no)/i,/^id$/i]},original_balance:{l:"Orig Bal",p:[/orig.?(bal|amount|principal)/i,/loan.?amount/i,/funded/i]},current_balance:{l:"Curr Bal",p:[/curr.?bal/i,/current.?(bal|amount)/i,/^upb$/i,/outstanding/i]},interest_rate:{l:"Rate",p:[/interest.?rate/i,/^rate$/i,/coupon/i,/^apr$/i]},original_term:{l:"Orig Term",p:[/orig.?term/i,/^term$/i,/loan.?term/i]},remaining_term:{l:"Rem Term",p:[/remain.?term/i,/rem.?term/i]},monthly_payment:{l:"Mo Pmt",p:[/monthly.?pay/i,/installment/i,/^pmt$/i]},fico_origination:{l:"FICO Orig",p:[/fico.?orig/i,/orig.?fico/i,/orig.?score/i]},fico_current:{l:"FICO Curr",p:[/fico.?curr/i,/curr.?fico/i,/fico$/i,/credit.?score$/i]},dti:{l:"DTI",p:[/^dti/i,/debt.?to.?income/i,/dti.?back/i]},loan_status:{l:"Status",p:[/loan.?status/i,/^status$/i]},dpd:{l:"DPD",p:[/days.?past/i,/^dpd$/i]},dpd_bucket:{l:"DPD Bucket",p:[/dpd.?bucket/i]},times_30dpd:{l:"30DPD Ct",p:[/times.?30/i]},times_60dpd:{l:"60DPD Ct",p:[/times.?60/i]},times_90dpd:{l:"90DPD Ct",p:[/times.?90/i]},origination_date:{l:"Orig Date",p:[/orig.?date/i,/origination/i,/issue.?date/i]},loan_purpose:{l:"Purpose",p:[/purpose/i]},state:{l:"State",p:[/state/i,/borrower.?state/i]},annual_income:{l:"Annual Inc",p:[/annual.?income/i,/gross.?income/i]},monthly_income:{l:"Mo Inc",p:[/monthly.?income/i]},employment_status:{l:"Empl",p:[/employ.?status/i]},employment_length:{l:"Empl Yrs",p:[/employ.?length/i]},grade:{l:"Grade",p:[/^grade$/i,/^sub.?grade$/i]},origination_channel:{l:"Channel",p:[/channel/i,/orig.?channel/i]},income_verification:{l:"Inc Verif",p:[/income.?verif/i,/verif.?status/i]},housing_status:{l:"Housing",p:[/housing/i,/home.?own/i]},open_accounts:{l:"Open Accts",p:[/open.?(acc|credit|lines)/i]},revolving_utilization:{l:"Rev Util",p:[/revolv.?util/i]},total_paid_principal:{l:"Princ Paid",p:[/total.?princ.?paid/i,/principal.?paid/i]},total_paid_interest:{l:"Int Paid",p:[/total.?int.?paid/i,/interest.?paid/i]},origination_fee:{l:"Orig Fee",p:[/orig.?fee/i]},late_fees:{l:"Late Fees",p:[/late.?fee/i]},recoveries:{l:"Recoveries",p:[/recover/i]},net_loss:{l:"Net Loss",p:[/net.?loss/i,/write.?off/i]},months_on_book:{l:"MOB",p:[/months.?on.?book/i,/loan.?age/i,/^mob$/i]},vintage:{l:"Vintage",p:[/vintage/i,/cohort/i,/orig.?year/i]},co_borrower:{l:"Co-Borr",p:[/co.?borrow/i,/joint/i]},hardship:{l:"Hardship",p:[/hardship/i,/forbear/i]},modification:{l:"Mod",p:[/modif/i,/tdr/i]},pd_score:{l:"PD",p:[/^pd/i,/prob.?default/i,/pd.?model/i]},lgd:{l:"LGD",p:[/^lgd/i,/loss.?given/i]},expected_loss:{l:"Exp Loss",p:[/expected.?loss/i,/^el$/i]},pool_id:{l:"Pool",p:[/pool/i,/trust/i]},servicer:{l:"Servicer",p:[/servicer/i]},investor:{l:"Investor",p:[/investor/i]},autopay:{l:"Autopay",p:[/auto.?pay/i]}};

// ═══ FORMATTERS ═══
export function pn(v){if(v==null||v==="")return null;var n=parseFloat(String(v).replace(/[$,%\s]/g,""));return isNaN(n)?null:n;}
export function fC(v){if(v==null)return"—";return v>=1e9?"$"+(v/1e9).toFixed(2)+"B":v>=1e6?"$"+(v/1e6).toFixed(2)+"M":v>=1e3?"$"+(v/1e3).toFixed(1)+"K":"$"+v.toFixed(0);}
export function fP(v){return(v||0).toFixed(1)+"%";}
export function fN(v){return(v||0).toLocaleString("en-US");}
export function fR(v){return(v||0).toFixed(2)+"%";}
export function fS(v){return String(Math.round(v||0));}

// ═══ COLUMN MATCHING ═══
export function ruleMatch(hdrs,rows,fields){var flds=fields||STD;var mp={},sc={};hdrs.forEach(function(h){var best=null,bs=0;Object.keys(flds).forEach(function(fk){var s=0;flds[fk].p.forEach(function(p){if(p.test(h.trim()))s+=50;});if(s>0&&rows.length>0){var vals=rows.slice(0,20).map(function(r){return r[h];}).filter(function(v){return v!=null&&v!=="";});if(vals.length>0){var nums=vals.map(pn).filter(function(v){return v!==null;}),nr=vals.length>0?nums.length/vals.length:0;if(nr>0.8){var av=_.mean(nums);if(av>300&&av<900)s+=15;else if(av>0&&av<35)s+=10;else if(av>100&&av<1e7)s+=5;}if(vals.filter(function(v){return/^[A-Z]{2}$/.test(String(v).trim());}).length>vals.length*0.5)s+=20;}}if(s>bs){bs=s;best=fk;}});if(best&&bs>=50){if(!sc[best]||bs>sc[best].s){if(sc[best])delete mp[sc[best].h];mp[h]=best;sc[best]={h:h,s:bs};}}});var r={};Object.keys(mp).forEach(function(h){r[mp[h]]=h;});return r;}

export function scoreTemplate(tpl,hdrs){
  var hits=0,total=0;
  Object.values(tpl.mapping).forEach(function(col){total++;if(hdrs.indexOf(col)>=0)hits++;});
  return total>0?hits/total:0;
}

// ═══ ANALYSIS ═══
export function doAnalyze(rows,mp){
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

// ═══ VALIDATION ═══
export function doValidate(rows,mp){var tc=0,mc=0,oor=0,issues=[];var rules={current_balance:{a:0,b:1e8},original_balance:{a:0,b:1e8},interest_rate:{a:0,b:35},fico_origination:{a:300,b:900},fico_current:{a:300,b:900},dti:{a:0,b:100}};rows.forEach(function(row,idx){Object.keys(mp).forEach(function(f){tc++;var v=row[mp[f]];if(v==null||v===""){mc++;return;}if(rules[f]){var n=pn(v);if(n!==null&&(n<rules[f].a||n>rules[f].b)){oor++;if(issues.length<20)issues.push(f+"="+v+" row "+(idx+1));}}});});return{comp:tc>0?((tc-mc)/tc)*100:0,mc:mc,oor:oor,issues:issues};}

// ═══ REGRESSION ═══
export function calcRegression(pts){
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

export function calcMultiReg(pts3){
  if(!pts3||pts3.length<5)return null;
  var n=pts3.length;
  var sx1=0,sx2=0,sy=0,sx1x1=0,sx2x2=0,sx1x2=0,sx1y=0,sx2y=0;
  pts3.forEach(function(p){sx1+=p.x1;sx2+=p.x2;sy+=p.y;sx1x1+=p.x1*p.x1;sx2x2+=p.x2*p.x2;sx1x2+=p.x1*p.x2;sx1y+=p.x1*p.y;sx2y+=p.x2*p.y;});
  var A=[[n,sx1,sx2],[sx1,sx1x1,sx1x2],[sx2,sx1x2,sx2x2]];
  var B=[sy,sx1y,sx2y];
  for(var i=0;i<3;i++){var mx=Math.abs(A[i][i]),mi=i;for(var j=i+1;j<3;j++){if(Math.abs(A[j][i])>mx){mx=Math.abs(A[j][i]);mi=j;}}if(mi!==i){var tmp=A[i];A[i]=A[mi];A[mi]=tmp;var tb=B[i];B[i]=B[mi];B[mi]=tb;}if(Math.abs(A[i][i])<1e-12)return null;for(var j2=i+1;j2<3;j2++){var f=A[j2][i]/A[i][i];for(var k=i;k<3;k++)A[j2][k]-=f*A[i][k];B[j2]-=f*B[i];}}
  var coef=[0,0,0];for(var i2=2;i2>=0;i2--){var s=B[i2];for(var j3=i2+1;j3<3;j3++)s-=A[i2][j3]*coef[j3];coef[i2]=s/A[i2][i2];}
  var yMean=sy/n,ssTot=0,ssRes=0;
  pts3.forEach(function(p){var yp=coef[0]+coef[1]*p.x1+coef[2]*p.x2;ssTot+=(p.y-yMean)*(p.y-yMean);ssRes+=(p.y-yp)*(p.y-yp);});
  var r2=ssTot>0?1-ssRes/ssTot:0;
  var adjR2=n>3?1-(1-r2)*(n-1)/(n-3):r2;
  return{b0:coef[0],b1:coef[1],b2:coef[2],r2:r2,adjR2:adjR2,n:n};
}
