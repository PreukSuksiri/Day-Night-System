//=============================================================================
// DayMonthYearTick.js (Ver1.0.1)
//=============================================================================
// 2020.Sep.19 Ver1.0.0  First Release

/*:
 * @target MZ
 * @plugindesc Allow showing quests as choice menu.
 * @author Preuk Suksiri
 *
 * @help DayMonthYearTick.js
 *
 * This plugin allow you to call common event when a time unit (minute / hour / day / week / month / year) has passed by.
 * You will need to prepare 6 common event slots (choose by yourself via the parameter of the plugin)
 * 1 day cycle start at 6AM until midnight 
 * 3 (real life) second = 1 minute (in-game)
 * 60 minutes (in-game) = 1 hour (in-game)
 * 18 hours = 1 day
 * 30 day = 1 month
 * 4 months = 1 year
 * 
  *
 * @param realLifeSecondEquivalent
 * @text Real Life Second Equivalent
 * @desc How many real life second equal to 1 in-game minute
 * @default 3
 * @type number
 *
 * @param minuteTickCommonEvent
 * @text Minute Tick Common Event
 * @desc ID of Common Event to run when one minute passed by
 * @default 0
 * @type common_event
 *
  * @param hourTickCommonEvent
 * @text Hour Tick Common Event
 * @desc ID of Common Event to run when one hour passed by
 * @default 0
 * @type common_event
 *
  * @param dayTickCommonEvent
 * @text Day Tick Common Event
 * @desc ID of Common Event to run when one day passed by
 * @default 0
 * @type common_event
 *
  * @param monthTickCommonEvent
 * @text Month Tick Common Event
 * @desc ID of Common Event to run when one month passed by
 * @default 0
 * @type common_event
 *
  * @param yearTickCommonEvent
 * @text Year Tick Common Event
 * @desc ID of Common Event to run when year day passed by
 * @default 0
 * @type common_event
 *
 * @param variableForDay
 * @text Variable ID to Store Day
 * @desc ID of variable to store Day
 * @default 1
 * @type number
  *
  * @param variableForMonth
 * @text Variable ID to Store Month
 * @desc ID of variable to store Month
 * @default 2
 * @type number
 *
  * @param variableForYear
 * @text Variable ID to Store Year
 * @desc ID of variable to store Year
 * @default 3
 * @type number
  *
  * @param variableForHour
 * @text Variable ID to Store Hour
 * @desc ID of variable to store Hour
 * @default 4
 * @type number
  *
  * @param variableForMinute
 * @text Variable ID to Store Minute
 * @desc ID of variable to store Minute
 * @default 5
 * @type number
 *
  * @param showTimeOnly
 * @text Show Only Time on HUD
 * @desc Show only hour and minute
 * @default false
 * @type boolean
 *
 * @param yearTickCommonEvent
 * @text Year Tick Common Event
 * @desc ID of Common Event to run when year day passed by
 * @default 0
 * @type common_event
 *
 * @command TimeStart
 * @text Time Start
 * @desc Start Time Tick 
 *
 * @command TimeStop
 * @text Time Stop
 * @desc Stop Time Tick
 */

(() => {
	
	// anonymous class for avoid nameclashing.
	var fnInterval = null;
	var fnInterval2 = null;
	var fnUpdate = null;

	var dataM = DataManager.createGameObjects;
	
	
	
	DataManager.createGameObjects = function(){
		dataM();
		
		
		const pluginName = 'DayMonthYearTick';
			const param  = PluginManager.parameters(pluginName);
			const minuteEventBind = Number(param.minuteTickCommonEvent);
			const hourEventBind = Number(param.hourTickCommonEvent);
			const dayEventBind = Number(param.dayTickCommonEvent);
			const weekEventBind = Number(param.weekTickCommonEvent);
			const monthEventBind = Number(param.monthTickCommonEvent);
			const yearEventBind = Number(param.yearTickCommonEvent);
			const varIDDay = Number(param.variableForDay);
			const varIDMonth = Number(param.variableForMonth);
			const varIDYear = Number(param.variableForYear);
			const varIDHour = Number(param.variableForHour);
			const varIDMinute = Number(param.variableForMinute);
			const varShowTimeOnly = String(param.showTimeOnly);
			  
			 //Init if not so
			  if ("_DayMonthYearTickPlugin" in $gameSystem == false)
			  {
			 
					$gameSystem._DayMonthYearTickPlugin = {};
					$gameSystem._DayMonthYearTickPlugin.RealLifeSecondEquivalent = param.realLifeSecondEquivalent;
					$gameSystem._DayMonthYearTickPlugin.MinuteCount = 0;
					$gameSystem._DayMonthYearTickPlugin.HourCount = 6;
					
					if (varShowTimeOnly == 'true')
					{
						$gameSystem._DayMonthYearTickPlugin.DayCount = 0;
						$gameSystem._DayMonthYearTickPlugin.WeekCount = 0;
						$gameSystem._DayMonthYearTickPlugin.MonthCount = 0;
						$gameSystem._DayMonthYearTickPlugin.YearCount = 0;
						
					}
					else
					{
						$gameSystem._DayMonthYearTickPlugin.DayCount = 1;
						$gameSystem._DayMonthYearTickPlugin.WeekCount = 1;
						$gameSystem._DayMonthYearTickPlugin.MonthCount = 1;
						$gameSystem._DayMonthYearTickPlugin.YearCount = 1;
						
					}
					
					$gameSystem._DayMonthYearTickPlugin.MinuteLimit =59;
					$gameSystem._DayMonthYearTickPlugin.HourLimit =23;
					$gameSystem._DayMonthYearTickPlugin.DayOfMonthLimit =30;
					$gameSystem._DayMonthYearTickPlugin.DayOfWeekLimit =7;
					$gameSystem._DayMonthYearTickPlugin.WeekLimit =4;
					$gameSystem._DayMonthYearTickPlugin.MonthLimit =4;
					$gameSystem._DayMonthYearTickPlugin.Enable =0;
					
					$gameSystem._DayMonthYearTickPlugin.TimeOnly = (varShowTimeOnly == 'true');
					
								$gameVariables.setValue(varIDDay,$gameSystem._DayMonthYearTickPlugin.DayCount);
								$gameVariables.setValue(varIDMonth,$gameSystem._DayMonthYearTickPlugin.MonthCount);
								$gameVariables.setValue(varIDYear,$gameSystem._DayMonthYearTickPlugin.YearCount);
								$gameVariables.setValue(varIDHour,$gameSystem._DayMonthYearTickPlugin.HourCount);
								$gameVariables.setValue(varIDMinute,$gameSystem._DayMonthYearTickPlugin.MinuteCount);
								$gameVariables.setValue(varIDMinute,$gameSystem._DayMonthYearTickPlugin.MinuteCount);
				 
			  }
			
			  
			  //Interval codes
			  
			  var dataInitTitle = Window_TitleCommand.initCommandPosition;
			  
			  Window_TitleCommand.initCommandPosition = function(){
				  $gameSystem._DayMonthYearTickPlugin.Enable = 0;
				dataInitTitle();

				
			  };
			  
			
			fnUpdate = function(){
				if (minuteEventBind >= 1)
								{
									$gameTemp.reserveCommonEvent(minuteEventBind);
								}
								
								if ($gameSystem._DayMonthYearTickPlugin.MinuteCount > $gameSystem._DayMonthYearTickPlugin.MinuteLimit)
								{
									$gameSystem._DayMonthYearTickPlugin.HourCount += 1;
									$gameSystem._DayMonthYearTickPlugin.MinuteCount = 0;
									if (hourEventBind >= 1)
									{
										$gameTemp.reserveCommonEvent(hourEventBind);
									}
								}
								
								if ($gameSystem._DayMonthYearTickPlugin.HourCount > $gameSystem._DayMonthYearTickPlugin.HourLimit)
								{
									if (varShowTimeOnly == 'false')
									{
										$gameSystem._DayMonthYearTickPlugin.DayCount += 1;
									}
									
									$gameSystem._DayMonthYearTickPlugin.HourCount = 0;
									if (dayEventBind >= 1)
									{
										$gameTemp.reserveCommonEvent(dayEventBind);
									}
								}
								
								if (varShowTimeOnly == 'false' && $gameSystem._DayMonthYearTickPlugin.DayCount > $gameSystem._DayMonthYearTickPlugin.DayOfWeekLimit)
								{
									$gameSystem._DayMonthYearTickPlugin.WeekCount += 1;
									/*
									if (weekEventBind >= 1)
									{
										$gameTemp.reserveCommonEvent(weekEventBind);
									}
									*/
								}
								
								if (varShowTimeOnly == 'false' && $gameSystem._DayMonthYearTickPlugin.DayCount > $gameSystem._DayMonthYearTickPlugin.DayOfMonthLimit)
								{
									$gameSystem._DayMonthYearTickPlugin.MonthCount += 1;
									$gameSystem._DayMonthYearTickPlugin.WeekCount = 1;
									$gameSystem._DayMonthYearTickPlugin.DayCount = 1;
									if (weekEventBind >= 1)
									{
										$gameTemp.reserveCommonEvent(monthEventBind);
									}
								}
								/*
								if ($gameSystem._DayMonthYearTickPlugin.WeekCount > $gameSystem._DayMonthYearTickPlugin.WeekLimit)
								{
									$gameSystem._DayMonthYearTickPlugin.MonthCount += 1;
									$gameSystem._DayMonthYearTickPlugin.WeekCount = 1;
									if (monthEventBind >= 1)
									{
										$gameTemp.reserveCommonEvent(monthEventBind);
									}
								}
								*/
								if (varShowTimeOnly == 'false' && $gameSystem._DayMonthYearTickPlugin.MonthCount > $gameSystem._DayMonthYearTickPlugin.MonthLimit)
								{
									$gameSystem._DayMonthYearTickPlugin.YearCount += 1;
									$gameSystem._DayMonthYearTickPlugin.MonthCount = 1;
									if (yearEventBind >= 1)
									{
										$gameTemp.reserveCommonEvent(yearEventBind);
									}
									
								}
								
								$gameVariables.setValue(varIDDay,$gameSystem._DayMonthYearTickPlugin.DayCount);
								$gameVariables.setValue(varIDMonth,$gameSystem._DayMonthYearTickPlugin.MonthCount);
								$gameVariables.setValue(varIDYear,$gameSystem._DayMonthYearTickPlugin.YearCount);
								$gameVariables.setValue(varIDHour,$gameSystem._DayMonthYearTickPlugin.HourCount);
								$gameVariables.setValue(varIDMinute,$gameSystem._DayMonthYearTickPlugin.MinuteCount);
				
			};
				
			fnInterval = function(){
				
			};
							
			fnInterval2 = function(){
				
				if ($gameSystem._DayMonthYearTickPlugin.Enable == 1)
				{
					$gameSystem._DayMonthYearTickPlugin.MinuteCount += 1;
					fnUpdate();
					
					
					if ($gameSystem._DayMonthYearTickPlugin.Enable == 1 )
					{
						 console.log(SceneManager.isGameActive());
						setTimeout(fnInterval2, $gameSystem._DayMonthYearTickPlugin.RealLifeSecondEquivalent*1000);
					}
				}
 
				
			};
				  
				  
				  
				//Register Plugin Commands
				PluginManager.registerCommand(pluginName, "TimeStart", args => {
				
					if ("_DayMonthYearTickPlugin" in $gameSystem == true)
					{
						
						$gameSystem._DayMonthYearTickPlugin.Enable = 1;
						setTimeout(fnInterval2, $gameSystem._DayMonthYearTickPlugin.RealLifeSecondEquivalent*1000);
						$gameSystem._DayMonthYearTickPlugin.ForceUpdate = fnUpdate;
					}
					
					
				});
				
				PluginManager.registerCommand(pluginName, "TimeStop", args => {
					
					$gameSystem._DayMonthYearTickPlugin.Enable = 0;
				});
		
				
		
	}




var dataM2 = DataManager.correctDataErrors;
	DataManager.correctDataErrors = function(){
		
		dataM2();
		if ("_DayMonthYearTickPlugin" in $gameSystem == true)
		{
			if ("Enable" in $gameSystem._DayMonthYearTickPlugin == true)
			{
				if ($gameSystem._DayMonthYearTickPlugin.Enable == 1)
				  {
					 
					setTimeout(fnInterval2, $gameSystem._DayMonthYearTickPlugin.RealLifeSecondEquivalent*1000);
					$gameSystem._DayMonthYearTickPlugin.ForceUpdate = fnUpdate;	
				  }
			}
			
		}
		
		
	}
	

})();

//Minute Functions
function DayMonthYearTickCheckMinuteEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MinuteCount == getValue;
	
}

function DayMonthYearTickCheckMinuteWithinRange(getValue,getValue2){
	return ($gameSystem._DayMonthYearTickPlugin.MinuteCount >= getValue) && ($gameSystem._DayMonthYearTickPlugin.MinuteCount <= getValue2);
}

function DayMonthYearTickCheckMinuteGreaterOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MinuteCount >= getValue;
}

function DayMonthYearTickCheckMinuteLessOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MinuteCount <= getValue;
}

function DayMonthYearTickSetMinute(getValue){
	$gameSystem._DayMonthYearTickPlugin.MinuteCount = getValue;
	
}

//Hour Funtions
function DayMonthYearTickCheckHourEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.HourCount == getValue;
	
}

function DayMonthYearTickCheckHourWithinRange(getValue,getValue2){
	return ($gameSystem._DayMonthYearTickPlugin.HourCount >= getValue) && ($gameSystem._DayMonthYearTickPlugin.HourCount <= getValue2);
}

function DayMonthYearTickCheckHourGreaterOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.HourCount >= getValue;
}

function DayMonthYearTickCheckHourLessOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.HourCount <= getValue;
}

function DayMonthYearTickSetHour(getValue){
	$gameSystem._DayMonthYearTickPlugin.HourCount = getValue;
	
}

//Clock Functions

function DayMonthYearTickGetCurrentClock(){
	return $gameSystem._DayMonthYearTickPlugin.HourCount.toString().padStart(2,'0') + ":" + $gameSystem._DayMonthYearTickPlugin.MinuteCount.toString().padStart(2,'0');
	
}

function DayMonthYearTickForceUpdate()
{
	$gameSystem._DayMonthYearTickPlugin.ForceUpdate();
}

//Day Functions
function DayMonthYearTickCheckDayOfWeekEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.DayCount == getValue;
	
}

function DayMonthYearTickCheckDayOfWeekWithinRange(getValue,getValue2){
	return ($gameSystem._DayMonthYearTickPlugin.DayCount >= getValue) && ($gameSystem._DayMonthYearTickPlugin.DayCount <= getValue2);
}

function DayMonthYearTickCheckDayOfWeekGreaterOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.DayCount >= getValue;
}

function DayMonthYearTickCheckDayOfWeekLessOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.DayCount <= getValue;
}


function DayMonthYearTickCheckDayOfMonthEqualTo(getValue){
	return ($gameSystem._DayMonthYearTickPlugin.DayCount * $gameSystem._DayMonthYearTickPlugin.WeekCount) == getValue;
	
}

function DayMonthYearTickCheckDayOfMonthWithinRange(getValue,getValue2){
	return (($gameSystem._DayMonthYearTickPlugin.DayCount * $gameSystem._DayMonthYearTickPlugin.WeekCount) >= getValue) && ($gameSystem._DayMonthYearTickPlugin.DayCount * $gameSystem._DayMonthYearTickPlugin.WeekCount) <= getValue2;
}

function DayMonthYearTickCheckDayOfMonthGreaterOrEqualTo(getValue){
	return ($gameSystem._DayMonthYearTickPlugin.DayCount * $gameSystem._DayMonthYearTickPlugin.WeekCount) >= getValue;
}

function DayMonthYearTickCheckDayOfMonthOrEqualTo(getValue){
	return ($gameSystem._DayMonthYearTickPlugin.DayCount * $gameSystem._DayMonthYearTickPlugin.WeekCount) <= getValue;
}

function DayMonthYearTickSetDay(getValue){
	$gameSystem._DayMonthYearTickPlugin.DayCount = getValue;
	
}

//Month Functions
function DayMonthYearTickCheckMonthEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MonthCount == getValue;
	
}

function DayMonthYearTickCheckMonthWithinRange(getValue,getValue2){
	return ($gameSystem._DayMonthYearTickPlugin.MonthCount >= getValue) && ($gameSystem._DayMonthYearTickPlugin.MonthCount <= getValue2);
}

function DayMonthYearTickCheckMonthGreaterOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MonthCount >= getValue;
}

function DayMonthYearTickCheckMonthLessOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MonthCount <= getValue;
}

function DayMonthYearTickSetMonth(getValue){
	$gameSystem._DayMonthYearTickPlugin.MonthCount = getValue;
	
}

//Year Functions
function DayMonthYearTickCheckYearEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.MonthYear == getValue;
	
}

function DayMonthYearTickCheckYearWithinRange(getValue,getValue2){
	return ($gameSystem._DayMonthYearTickPlugin.YearCount >= getValue) && ($gameSystem._DayMonthYearTickPlugin.YearCount <= getValue2);
}

function DayMonthYearTickCheckYearGreaterOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.YearCount >= getValue;
}

function DayMonthYearTickCheckYearLessOrEqualTo(getValue){
	return $gameSystem._DayMonthYearTickPlugin.YearCount <= getValue;
}

function DayMonthYearTickSetYear(getValue){
	$gameSystem._DayMonthYearTickPlugin.YearCount = getValue;
	
}


