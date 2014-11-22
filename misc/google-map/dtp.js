/**
 * Visual control for date and time input.
 *
 * Author: Aleksey Morarash <aleksey.morarash@gmail.com>
 * Since: 21 May 2006
 */

function MDateTimePicker(newDate, onlydate){

    /**
     * Defines control type.
     * If true - only date, false - date and time.
     */
    this.dateOnly = true;

    /**
     * Holds date and time value.
     */
    this.date = newDate || new Date();

    /**
     * Holds identifier of the DOM element.
     */
    this.identifier = Math.round(Math.random() * 999999);

    /**
     * Sets the date and time.
     */
    this.setDate = function (date) {
        this.date = date || new Date();
        this.fireDateChanged();
    }

    /**
     * Returns the date and time.
     */
    this.getDate = function () {
        return this.date;
    }

    // ----------------------------------------------------------------------
    // Setters
    // ----------------------------------------------------------------------

    this.setYear = function(value){
        this.date.setFullYear(this.forceint(value, 1970, 2100));
        this.fireDateChanged();
    }

    this.setMonth = function(value){
        this.date.setMonth(this.forceint(value, 1, 12) - 1);
        this.fireDateChanged();
    }

    this.setDayOfMonth = function(value){
        this.date.setDate(this.forceint(value, 1, 31));
        this.fireDateChanged();
    }

    this.setHours = function(value){
        this.date.setHours((this.dateOnly)?0:this.forceint(value, 0, 23));
        this.fireDateChanged();
    }

    this.setMinutes = function(value){
        this.date.setMinutes((this.dateOnly)?0:this.forceint(value, 0, 59));
        this.fireDateChanged();
    }

    this.setSeconds = function(value){
        this.date.setSeconds((this.dateOnly)?0:this.forceint(value, 0, 59));
        this.fireDateChanged();
    }

    // ----------------------------------------------------------------------
    // Getters
    // ----------------------------------------------------------------------

    this.getYear = function(value){
        return this.date.getFullYear();
    }

    this.getMonth = function(value){
        return (this.date.getMonth() + 1);
    }

    this.getDayOfMonth = function(value){
        return this.date.getDate();
    }

    this.getHours = function(value){
        return (this.dateOnly)?0:this.date.getHours();
    }

    this.getMinutes = function(value){
        return (this.dateOnly)?0:this.date.getMinutes();
    }

    this.getSeconds = function(value){
        return (this.dateOnly)?0:this.date.getSeconds();
    }

    /**
     * Returns identifier for day button object.
     */
    this.getDayButtonID = function (row, col) {
        return "db" + this.identifier + "r" +
	    (row || "0") + "c" + (col || "0");
    }

    /**
     * Returns day button object.
     */
    this.getDayButton = function (row, col) {
        return document.getElementById(this.getDayButtonID(row, col));
    }

    /**
     * Set DateTimePicker dialog hidden or not.
     */
    this.setHidden = function (object, isHidden) {
        if(isHidden) {
            object.style.display = '';
        }else{
            object.style.display = 'none';
        }
    }

    /**
     * Return true if DateTimePicker dialog is hidden.
     */
    this.isHidden = function (object) {
        return (object.style.display == 'none');
    }

    /**
     * Fill day cell with day number (from 1 to 31).
     */
    this.setDayButtonValue = function (row, col, value) {
        this.setHidden(this.getDayButton(row, col), value);
        this.getDayButton(row, col).value = ((value < 10)?"0":"") + value;
    }

    /**
     * Return number of days in the month.
     */
    this.getDayCountForMonth = function (year, month) {
        var day = 27;
        var tmpDate;
        do {
            tmpDate = new Date(year, month, day++);
        } while (tmpDate.getMonth() == month);
        return (day - 2);
    }

    /**
     * Return weekday of the first day of the month.
     * (0 - monday and so on)
     */
    this.getFirstDayOfMonth = function (year, month) {
        var firstDayOfMonthDate = new Date(year, month, 1, 0, 0, 0);
        var firstDayWeekDay = firstDayOfMonthDate.getDay() - 1;
        if(firstDayWeekDay < 0) firstDayWeekDay = 6;
        return firstDayWeekDay;
    }

    /**
     * Clear the cells with day numbers.
     */
    this.clear = function () {
        for(var row = 0; row < 6; row++)
            for(var col = 0; col < 7; col++){
                this.setDayButtonValue(row, col, '');
                this.getDayButton(row, col).style.backgroundColor =
		    'transparent';
            }
    }

    /**
     * Fill the cells with day numbers according to current month.
     */
    this.fireDateChanged = function () {
        this.clear();
        // fetch current year and month
        var year = this.date.getFullYear();
        var month = this.date.getMonth();
        // start to render the days in the cells
        var maxDay = this.getDayCountForMonth(year, month);
        var row = 0;
        var col = this.getFirstDayOfMonth(year, month);

        // find the current date (to select current day)
        var currentYear = (new Date()).getFullYear();
        var currentMonth = (new Date()).getMonth();
        var currentDay = (new Date()).getDate();

        // render the days
        for(var day = 1; day <= maxDay; day++){
            this.setDayButtonValue(row, col, day);

            // if the day is today then select it
            if(year == currentYear &&
	       month == currentMonth &&
	       day == currentDay)
		this.getDayButton(row, col).style.backgroundColor = 'red';

            col++;
            if(col > 6) {
                col = 0;
                row++;
            }
        }
        // select the day
        this.selectDay(this.date.getDate());

        // update all others controls
        this.updateControls();
    }

    this.updateControls = function () {
        // update 'Year' and 'Month' fields
        document.getElementById(
	    "id" + this.identifier + "year").value =
	    this.date.getFullYear();
        var realMonth = this.date.getMonth() + 1;
        document.getElementById(
	    "id" + this.identifier + "month").value =
	    ((realMonth < 10)?"0":"") + realMonth;
        // update 'hours' and 'mins' fields
        if(!this.dateOnly){
            document.getElementById(
		"id" + this.identifier + "hour").value =
		((this.date.getHours() < 10)?"0":"") +
		this.date.getHours();
            document.getElementById(
		"id" + this.identifier + "minute").value =
		((this.date.getMinutes() < 10)?"0":"") +
		this.date.getMinutes();
        }
        // update the main control
        document.getElementById("id" + this.identifier + "main").value =
            ((this.date.getDate() < 10)?"0":"") +
	    this.date.getDate() + "/" +
            ((this.date.getMonth() + 1 < 10)?"0":"") +
	    (this.date.getMonth() + 1) + "/" +
            this.date.getFullYear() +
            ((this.dateOnly)?"":(" " +
				 ((this.date.getHours() < 10)?"0":"") +
				 this.date.getHours() + ":" +
				 ((this.date.getMinutes() < 10)?"0":"") +
				 this.date.getMinutes()));
    }

    /**
     * Remove selection from all buttons.
     */
    this.unselectDays = function () {
        for(var row = 0; row < 6; row++)
            for(var col = 0; col < 7; col++){
                var obj = this.getDayButton(row, col);
                obj.style.color = 'black';
                obj.style.fontWeight = 'normal';
            }
    }

    /**
     * Selects the day.
     */
    this.selectDay = function (day) {
        this.unselectDays();
        var row = this.translate2row(day);
        var col = this.translate2col(day);
        var obj = this.getDayButton(row, col);
        obj.style.color = 'yellow';
        obj.style.fontWeight = 'bold';
    }

    /**
     * Selects the cell.
     */
    this.selectCell = function (row, col) {
        this.unselectDays();
        var obj = this.getDayButton(row, col);
        obj.style.color = 'yellow';
        obj.style.fontWeight = 'bold';
        this.date.setDate(this.translate2day(row, col));
        this.updateControls();
    }

    /**
     * Convert day of the current month to index
     * of a row in the table of buttons.
     */
    this.translate2row = function (day) {
        day += this.getFirstDayOfMonth(this.date.getFullYear(),
				       this.date.getMonth()) - 1;
        var col = 0;
        while(day > 6) {
            day -= 7;
            col++;
        }
        return col;
    }

    /**
     * Convert day of the current month to index
     * of a column in the table of buttons.
     */
    this.translate2col = function (day) {
        day += this.getFirstDayOfMonth(this.date.getFullYear(),
				       this.date.getMonth()) - 1;
        while(day > 6) day -= 7;
        return day;
    }

    this.translate2day = function (row, col) {
        return (row * 7) + col -
	    this.getFirstDayOfMonth(
		this.date.getFullYear(), this.date.getMonth()) + 1;
    }

    this.addYear = function (years) {
        this.date.setFullYear(this.date.getFullYear() + (years || 0));
        this.fireDateChanged();
    }

    this.addMonth = function (months) {
        this.date.setMonth(this.date.getMonth() + (months || 0));
        this.fireDateChanged();
    }

    this.addHour = function (hours) {
        this.date.setHours(this.date.getHours() + (hours || 0));
        this.fireDateChanged();
    }

    this.addMinute = function (minutes) {
        this.date.setMinutes(this.date.getMinutes() + (minutes || 0));
        this.fireDateChanged();
    }


    this.showDialog = function () {
        this.setHidden(
	    document.getElementById(
		"id" + this.identifier + "dialog"), true);
    }

    this.hideDialog = function () {
        this.setHidden(
	    document.getElementById(
		"id" + this.identifier + "dialog"), false);
        this.fireDateChanged();
        // fire event handler, if defined
        if(this.onChange) this.onChange();
    }

    this.switchDialog = function () {
        var obj = document.getElementById("id" + this.identifier + "dialog");
        this.setHidden(obj, this.isHidden(obj));
    }

    this.forceint = function(value, min, max) {
        value = 0 + value;
        if(value < min) value = min;
        if(value > max) value = max;
        return value;
    }

    // ----------------------------------------------------------------------
    // Create control
    // ----------------------------------------------------------------------

    this.dateOnly = onlydate;
    var spinBtnStyle =
	'margin:0; padding:0; font-size:10; border-style:none; ' +
	'border-width:0; cursor:hand; color:navy; ';
    var inpStyle =
	'margin:0; padding:0; font-size:10; border-style:none; ' +
	'border-width:0; text-align:center;';

    // create an HTML table with buttons
    document.writeln(
	"<span id='id" + this.identifier + "dialog' " +
	    "style='position:absolute; display:none; z-index:9999'>");
    document.writeln(
        "<br clear=all><table " +
            "cellspacing=0 cellpadding=0 border=1 " +
            "style='background-color:silver;'>" +
            "<tr><td colspan=7 style='margin:0; padding:0; font-size:10;'>" +
            "Year:&nbsp;" +
            "<span id='id" + this.identifier + "yeard' style='" +
	    spinBtnStyle + "' " +
            "onclick='this.pickerLink.addYear(-1);'>&lt;</span>" +
            "<input type=edit id='id" + this.identifier +
	    "year' size=4 style='" + inpStyle + "' " +
            "onchange='this.pickerLink.setYear(this.value);'>" +
            "<span id='id" + this.identifier + "yeari' style='" +
	    spinBtnStyle + "' " +
            "onclick='this.pickerLink.addYear(1);'>&gt;</span>" +
            "&nbsp;Month:&nbsp;" +
            "<span id='id" + this.identifier + "monthd' style='" +
	    spinBtnStyle + "' " +
            "onclick='this.pickerLink.addMonth(-1);'>&lt;</span>" +
            "<input type=edit id='id" + this.identifier +
	    "month' size=2 style='" + inpStyle + "' " +
            "onchange='this.pickerLink.setMonth(this.value);'>" +
            "<span id='id" + this.identifier + "monthi' style='" +
	    spinBtnStyle + "' " +
            "onclick='this.pickerLink.addMonth(1);'>&gt;</span>" +
            "</td></tr>" +
            "<tr style='text-align:center;'>" +
            "<td><tt><b>Mo</b></tt></td>" +
            "<td><tt><b>Tu</b></tt></td>" +
            "<td><tt><b>We</b></tt></td>" +
            "<td><tt><b>Th</b></tt></td>" +
            "<td><tt><b>Fr</b></tt></td>" +
            "<td style='color:red'><tt><b>Sa</b></tt></td>" +
            "<td style='color:red'><tt><b>Su</b></tt></td>" +
            "</tr>");
    document.getElementById(
	"id" + this.identifier + "yeard").pickerLink = this;
    document.getElementById(
	"id" + this.identifier + "year").pickerLink = this;
    document.getElementById(
	"id" + this.identifier + "yeari").pickerLink = this;
    document.getElementById(
	"id" + this.identifier + "monthd").pickerLink = this;
    document.getElementById(
	"id" + this.identifier + "month").pickerLink = this;
    document.getElementById(
	"id" + this.identifier + "monthi").pickerLink = this;
    var inputStyle =
	"border-style:none; border-width:0; padding:0; margin:0; " +
        "background-color:transparent; font-size:10; width:25; ";
    for(var row = 0; row < 6; row++){
        document.writeln("<tr>");
        for(var col = 0; col < 7; col++){
            document.writeln(
		"<td><center><input id='" +
		    this.getDayButtonID(row, col) + "' " +
                    "style='" + inputStyle + "' " +
                    "type=button " +
                    "onclick='this.pickerLink.selectCell(" + row + "," +
		    col + ");'></center></td>");
            document.getElementById(
		this.getDayButtonID(row, col)).pickerLink = this;
        }
        document.writeln("</tr>");
    }
    document.write(
        "<tr><td colspan=7 style='margin:0; padding:0; font-size:10;'>");
    if(this.dateOnly){
        document.write("<div style='text-align:right;'>");
    }else{
        document.write(
            "Time:&nbsp;" +
                "<span id='id" + this.identifier + "hourd' style='" +
		spinBtnStyle + "' " +
                "onclick='this.pickerLink.addHour(-1);'>&lt;</span>" +
                "<input type=edit   id='id" + this.identifier +
		"hour'   size=2 style='" + inpStyle + "' " +
                "onchange='this.pickerLink.setHours(this.value);'>" +
                "<span id='id" + this.identifier + "houri' style='" +
		spinBtnStyle + "' " +
                "onclick='this.pickerLink.addHour(1);'>&gt;</span>" +
                "&nbsp;:&nbsp;" +
                "<span id='id" + this.identifier + "minuted' style='" +
		spinBtnStyle + "' " +
                "onclick='this.pickerLink.addMinute(-1);'>&lt;</span>" +
                "<input type=edit   id='id" + this.identifier +
		"minute'  size=2 style='" + inpStyle + "' " +
                "onchange='this.pickerLink.setMinutes(this.value);'>" +
                "<span id='id" + this.identifier + "minutei' style='" +
		spinBtnStyle + "' " +
                "onclick='this.pickerLink.addMinute(1);'>&gt;</span>" +
                "&nbsp;&nbsp;");
    }
    document.write(
        "<input  id='id" + this.identifier +
	    "dlgok' type=button value='OK' " +
            "style='padding:0; margin:0; font-size:10;' " +
            "onclick='this.pickerLink.hideDialog();'>");
    if(this.dateOnly) document.write("</div>");
    document.writeln("</td></tr></table></span>");
    if(!this.dateOnly){
        document.getElementById(
	    "id" + this.identifier + "hourd").pickerLink = this;
        document.getElementById(
	    "id" + this.identifier + "hour").pickerLink = this;
        document.getElementById(
	    "id" + this.identifier + "houri").pickerLink = this;
        document.getElementById(
	    "id" + this.identifier + "minuted").pickerLink = this;
        document.getElementById(
	    "id" + this.identifier + "minute").pickerLink = this;
        document.getElementById(
	    "id" + this.identifier + "minutei").pickerLink = this;
    }
    document.getElementById(
	"id" + this.identifier + "dlgok").pickerLink = this;

    document.writeln(
	"<span style='font-family:verdana,tahoma,arial; '>" +
	    "<input type=edit id='id" + this.identifier + "main' " +
	    "style='margin:0; padding:0; font-size:10; " +
	    "border-style:solid; border-width:1;' " +
	    "onfocus='this.pickerLink.switchDialog();'>" +
	    "</span>");
    document.getElementById(
	"id" + this.identifier + "main").pickerLink = this;

    // let's set button captions
    this.fireDateChanged();

    return this;
}
