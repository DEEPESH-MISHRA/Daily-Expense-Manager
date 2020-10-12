import { LightningElement, track, wire, api } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import getSelectedDateExpenses from "@salesforce/apex/GetAllExpenses.getSelectedDateExpenses";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import EXPENSE_RECORD_OBJECT from "@salesforce/schema/Expense_Record__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import ExpenseCurrency__FIELD from "@salesforce/schema/Expense_Record__c.ExpenseCurrency__c";
import getCategoryPicklistValues from "@salesforce/apex/GetAllExpenses.getCategoryPicklistValues";
import addNewCategoryValue from "@salesforce/apex/GetAllExpenses.addNewCategoryValue";
import deleteCategoryValue from "@salesforce/apex/GetAllExpenses.deleteCategoryValue";
import addDefaultCategoryValue from "@salesforce/apex/GetAllExpenses.addDefaultCategoryValue";
import fetchDefaultCategoryValue from "@salesforce/apex/GetAllExpenses.fetchDefaultCategoryValue";
import addDefaultCurrencyValue from "@salesforce/apex/GetAllExpenses.addDefaultCurrencyValue";
import fetchDefaultCurrencyValue from "@salesforce/apex/GetAllExpenses.fetchDefaultCurrencyValue";
import initializeCustomSettingValues from "@salesforce/apex/GetAllExpenses.initializeCustomSettingValues";

// /** 
//   * @desc this class will contains functions which will handle different functionalities of our component. 
//   * examples include populateCategory(), addDefaultCategory(), fetchDefaultCurrency(), deleteCurrencyValue().
//   * @author 
//   * @required GetAllExpenses.cls, daily_Expense_Manager.html, daily_Expense_Manager.js-meta.xml
// */
export default class Daily_Expense_Manager extends LightningElement {
  MIN_RANGE = 0;
  MAX_RANGE = 99999999.99;
  @track dataModifierFetchPickValue = 0;
  @track resultOfInitializeCustomSettingValues;
  @track errorInConnectedCallback;
  @track currentDate = this.todaysDate();
  @track defaultExpenseCategory;
  @track expenseCategory = this.defaultExpenseCategory;
  @track defaultExpenseCurrency;
  @track currencyType = this.defaultExpenseCurrency;
  @track amount;
  @track remarks;
  @track newExpenseCategory;
  @track showHomeOrSettingsPage = true;
  @track selectedDate;
  @track selectedExpenses;
  @track dataDetails;
  @track dataOfGetSelectedDateExpenses;
  @track sumExpense = 0;
  @track currencyType;
  @track dataModifier = 0;
  @track defaultCurrency;
  @track categories = [];
  @track currencies = [];
  @track objectDefaultRecordTypeId;
  @track objectInfoError;
  @track objectInfoData;
  @track listOfCatPicklistValues;
  @track arrayOfCatPicklistValues = [];
  @track dataModifierPicklistValue = 0;
  @track dataModifierFetchCurrencyValue = 0;
  @track populateCategoryError;
  @track currencySymbol; 
  @track currencyPickValuesData;
  @track currencyPickValuesError;
  
  //getting the current Date in the desired format (selected format) in the record list view on the front page.
  @track currentDateFormatted = this.ConvertDateFormat(this.currentDate);

  //Onload function to check whether required Custom Setting Object exists in the Org.
  connectedCallback() {
    //console.log("connected  before callback");
    initializeCustomSettingValues()
      .then((result) => {
        this.resultOfInitializeCustomSettingValues = result;
        this.errorInConnectedCallback = undefined;
      })
      .catch((error) => {
        this.errorInConnectedCallback = error;
      });   
      setTimeout(() => { this.dataModifierFetchPickValue=1;
        this.dataModifierPicklistValue=1;}, 1000);  
  }
 
  /*
    * @desc to get current date.
    * @param no parameter.
    * @return Date - current date.
  */
  todaysDate() {
    //console.log('Inside  todaysDate() funtion');
    this.today = new Date();
    let dd = String(this.today.getDate()).padStart(2, "0");    
    let mm = String(this.today.getMonth() + 1).padStart(2, "0");
    let month = "";
    //console.log("value of this.mm :"+ this.mm);
    let yyyy = this.today.getFullYear();
    this.today = yyyy + "-" + mm + "-" + dd;
    //console.log("value of mm :"+ mm);
    //console.log(this.today);
    return this.today;
  }
  
  /*
    * @desc to get desired date format in the display list to maintain consistency in date format.
    * @param Date datePara - date value which is to be formatted.
    * @return String - formatted date.
  */
  ConvertDateFormat(datePara) {
    //console.log('Inside  ConvertDateFormat() funtion');
    let originalString = "";
    originalString = datePara;
    let splitString = originalString.split("-");
    //console.log(splitString);
    let dd = splitString[2];
    //console.log("ConvertDateFormat value of dd :"+ dd);
    let mm = splitString[1];
    //console.log("ConvertDateFormat value of mm :"+ mm);
    let yy = splitString[0];
    //console.log("ConvertDateFormat value of yy :"+ yy);

    let month = "";
    switch (mm) {
      case "01":
        month = "Jan";
        break;
      case "02":
        month = "Feb";
        break;
      case "03":
        month = "Mar";
        break;
      case "04":
        month = "Apr";
        break;
      case "05":
        month = "May";
        break;
      case "06":
        month = "Jun";
        break;
      case "07":
        month = "Jul";
        break;
      case "08":
        month = "Aug";
        break;
      case "09":
        month = "Sep";
        break;
      case "10":
        month = "Oct";
        break;
      case "11":
        month = "Nov";
        break;
      case "12":
        month = "Dec";
        break;
      default:
        month = "No month found";
    }
    this.dateFormatted = month + " " + dd + ", " + yy;
    //console.log("ConvertDateFormat this.today1 :"+this.dateFormatted);
    return this.dateFormatted;
  } 

  //column variable for data-table in the html.
  @track columns = [
    {
      label: "S.No",
      fieldName: "PSI_DEM__Sr_no__c",
      type: "text",
      fixedWidth: 70,
      hideDefaultActions: true
    },
    {
      label: "Category",
      //hideDefaultActions: false,
      fieldName: "PSI_DEM__ExpenseCategory__c",
      type: "text",
      //fixedWidth: 110,
      //hideDefaultActions: true,
      wrapText: true
    },
    {
      label: "Amount",
      fieldName: "PSI_DEM__Default_Currency__c",
      type: "text",
      fixedWidth: 140,
      hideDefaultActions: true
      //wrapText: true
    },
    {
      label: "Remarks",
      fieldName: "PSI_DEM__ExpenseRemarks__c",
      type: "text",
      //initialWidth: 100,
      //hideDefaultActions: false,
      wrapText: true
    }
  ];  
  
   /*
    * @desc to get category piclist value from the database and populate the drop down field.
    * @param error, data - recieves error or data values depending uppon the response of apex class funtion.
    * @return nothing.
    */
  @wire(getCategoryPicklistValues, {dataModifier: "$dataModifierPicklistValue"})
  populateCategory({ error, data }) {
    //console.log('Inside getCategoryPicklistValues() funtion');
    if (data) {
      this.listOfCatPicklistValues = data;
      //console.log(JSON.stringify(this.listOfCatPicklistValues, null, "\t"));
      this.dataModifierFetchPickValue = this.dataModifierFetchPickValue + 1;
      this.arrayOfCatPicklistValues = this.listOfCatPicklistValues;
      //console.log(JSON.stringify(this.arrayOfCatPicklistValues, null, "\t"));
      //console.log("LIST ARRAY VALUE:" + this.arrayOfCatPicklistValues[0]);
      this.categories.splice(0, this.categories.length);
      //console.log("Splice Category" + this.categories);
      this.categories = [{ label: "--Select--", value: "--Select--" }];
      //console.log("Splice Category" + this.categories);
      this.categories.pop();
      //pushing values obtained from custom list into an array used in html in the combobox.
      for (let catValue of this.arrayOfCatPicklistValues) {
        const newCategory = { label: catValue, value: catValue };
        //console.log(newCategory);
        this.categories.push(newCategory);
      }
      //to sort the category values in alphabatical order in the drop down field.
      this.categories.sort(function (firstValue, nextValue) {
        var firstValueLowerCase = firstValue.value.toLowerCase();
        var nextValueLowerCase = nextValue.value.toLowerCase();
        if (firstValueLowerCase < nextValueLowerCase) {
          return -1;
        }
        if (firstValueLowerCase > nextValueLowerCase) {
          return 1;
        }
        return 0;
      });
      this.expenseCategory = this.defaultExpenseCategory;
    } else if (error) {
      //console.log('ERROR in  getCategoryPicklistValues() function, value not recieved.');
      this.populateCategoryError = error;
    }
  }
  
   /*
    * @desc to fetch default category value from the custom setting field.
    * @param error, data - recieves error or data values depending uppon the response of apex class funtion.
    * @return nothing.
    */
  @wire(fetchDefaultCategoryValue, {dataModifier: "$dataModifierFetchPickValue"})
  defaultCategory({ error, data }) {
    //console.log('Inside fetchDefaultCategoryValue() function');
    if (data) {
      //console.log('Default Category Value:' + data);
      //console.log('Default Category Value:' + JSON.stringify(data, null, '\t'));
      //fetches the default category value stored in custom settings and assigns to variable
      this.defaultExpenseCategory = data[0];
      this.expenseCategory = this.defaultExpenseCategory;
      //console.log('this.expenseCategory' + this.expenseCategory);
    } else if (error) {
      //console.log('ERROR in  fetchDefaultCategoryValue() function, value not recieved.');
    }
  }
 
   /*
    * @desc to fetch default category value from the custom setting field.
    * @param error, data - recieves error or data values depending uppon the response of apex class funtion.
    * @return nothing.
    */
  @wire(fetchDefaultCurrencyValue, {dataModifier: "$dataModifierFetchCurrencyValue"})
  defaultCurrencyFetch({ error, data }) {
    //console.log('Inside fetchDefaultCurrencyValue() function');
    if (data) {
      //console.log('Default Currency Value:' + data);
      //console.log('Default Currency Value:' + JSON.stringify(data, null, '\t'));
      this.defaultExpenseCurrency = data[0];
      this.currencyType = this.defaultExpenseCurrency;
      //gets the currency symbol from default currency string value and stores in currency symbol variable.
      this.currencySymbol = this.defaultExpenseCurrency.substr(0,this.currencyType.indexOf(" "));
      //console.log('Default Currency CHECK:' +  this.currencyType);
    } else if (error) {
      //console.log('ERROR in  fetchDefaultCurrencyValue() function, value not recieved.');
    }
  } 
   /*
    * @desc getter function which will provide category values in the html combobox.
    * @param no parameter.
    * @return Array of Objects - categories value.
    */
  get categoryOptions() {
    //console.log('Inside categoryOptions() getter function');
    return this.categories;
  }  
   /*
    * @desc to get default record type value from the custom Expense_Record__c Object.
    * @param error, data - recieves error or data values depending uppon the response of apex class funtion.
    * @return nothing.
    */
  @wire(getObjectInfo, { objectApiName: EXPENSE_RECORD_OBJECT })
  objectInfo({ error, data }) {
    //console.log('Inside getObjectInfo() function');
    if (data) {
      // gets Object information and stores in variable objectInfoData.
      this.objectInfoData = data;
      // gets record type id and stores in variable objectDefaultRecordTypeId.
      this.objectDefaultRecordTypeId = this.objectInfoData.defaultRecordTypeId;
      //console.log('Object Info:' + this.objectDefaultRecordTypeId);
      //console.log('EXPCALCI :' + EXPENSE_RECORD_OBJECT);
    } else if (error) {
      //console.log('ERROR in getObjectInfo() function, value not recieved.');
      this.objectInfoError = error;
    }
  } 
   /*
    * @desc to get pick list values from the custom ExpenseCurrency__c Field.
    * @param error, data - recieves error or data values depending uppon the response of apex class funtion.
    * @return nothing.
    */  
  @wire(getPicklistValues, {
    recordTypeId: "$objectDefaultRecordTypeId",
    fieldApiName: ExpenseCurrency__FIELD
  })
  currencyPickValues({ error, data }) {
    //console.log('Inside getPicklistValues() function');
    if (data) {
      //gets metadata of the Picklist Type field ExpenseCurrency__c in the Org.
      this.currencyPickValuesData = data;
      //assigns picklist value of the Picklist Type field ExpenseCurrency__c in the Org to a variable.
      this.currencies = this.currencyPickValuesData.values;
      //to invoke fetchDefaultCurrencyValue() function.
      this.dataModifierFetchCurrencyValue = this.dataModifierFetchCurrencyValue + 1;
      this.currencyType = this.defaultExpenseCurrency;
    } else if (error) {
      //console.log('ERROR in getPicklistValues() function, value not recieved.');
      this.currencyPickValuesError = error;
    }
  }  
   /*
    * @desc getter function which will provide currency values in the html combobox.
    * @param no parameter.
    * @return Array of Objects - currency values with their symbols.
    */
  get currencyOptions() {
    //console.log('Inside currencyOptions() getter function');
    return this.currencies;
  }  
   /*
    * @desc date handler function accepts date input field value and saves in a variable in required format.
    * @param event.
    * @return nothing.
    */  
  dateChangeHandler(event) {
    //console.log('Inside dateChangeHandler() function');
    this.currentDate = event.target.value;
    //console.log('Current Date: ' + this.currentDate);
    //converts date from input field into required format.
    this.currentDateFormatted = this.ConvertDateFormat(this.currentDate);
  }  
   /*
    * @desc expenseCategory handler function, accepts category input field value and saves in a variable.
    * @param event.
    * @return nothing.
    */
  expenseCategoryChangeHandler(event) {
    //console.log('Inside expenseCategoryChangeHandler() function');
    this.expenseCategory = event.target.value;
  }  
   /*
    * @desc amountChange handler function, accepts amount input field value and saves in a variable.
    * @param event.
    * @return nothing.
    */
  amountChangeHandler(event) {    
    //console.log("Inside amountChangeHandler() function");
    //console.log("event.target.value :" + event.target.value);
    //checks for values greater than or equal to zero and is within the specified range or not.
    if (event.target.value >= this.MIN_RANGE && event.target.value <= this.MAX_RANGE) {
      let amountValue = event.target.value;
      //checks if the input amount value is a decimal number.
      if (
        amountValue.indexOf(".") >= 0 &&
        amountValue.length - 1 > amountValue.indexOf(".")
      ) {
        //checks if the input amount has more than two decimal places, if so disables the button.
        if (
          amountValue.substr(amountValue.indexOf(".") + 1, amountValue.length)
            .length > 2
        ) {
          //console.log("Inside If condition of btn active-deactive");
          let addbtn = this.template.querySelector("lightning-button.add");
          addbtn.disabled = true;
        }
        // if amount value contains less than or equal to two decimal places enable the add button
        else {
          //console.log("Inside else condition of btn active-deactive");
          let addbtn = this.template.querySelector("lightning-button.add");
          addbtn.disabled = false;
        }
      }
      //if input amount value is integer value it enables "ADD" button.
      else {
        //console.log("Inside first else condition of btn active-deactive");
        let addbtn = this.template.querySelector("lightning-button.add");
        addbtn.disabled = false;
      }
      // if amount value is integer or decimal value with two decimal digits then assign amount input field to variable "amount";
      this.amount = event.target.value;
    } else {
      if (event.target.value == null) {
        this.amount = null;
      }
      // if amount field value is negative and beyong the range.
      else {        
        this.amount = event.target.value;
      }
    }
  }  
   /*
    * @desc remarksChangeHandler function accepts remarks input field value and saves in a variable.
    * @param event.
    * @return nothing.
    */  
  remarksChangeHandler(event) {
    //console.log('Inside remarksChangeHandler() function');
    if (event.target.value == "" || event.target.value == null){
      this.remarks = "   ";
    }
    else {
      this.remarks = event.target.value;
    }    
  }  
   /*
    * @desc addDefaultExpenseCategoryHandler function accepts default category value and saves in custom settings in the Org.
    * @param event.
    * @return nothing.
    */  
  addDefaultExpenseCategoryHandler(event) {
    //console.log('Inside addDefaultExpenseCategoryHandler() function');
    this.defaultExpenseCategory = event.target.value;    
   /*
    * @desc function accepts default category value and saves in custom settings in the Org.
    *       calls function written in apex class with a parameter carrying the default category input value.
    * @param String defaultCategoryValue.
    * @return nothing.
    */  
    addDefaultCategoryValue({defaultCategoryValue: this.defaultExpenseCategory})
      .then((result) => {
        if (result) {
          //console.log('Inside addDefaultCategoryValue() if section, value returned successfully');

        } else {
          //console.log('ERROR in addDefaultCategoryValue() function, value not recieved.');
        }
      })
      .catch((error) => {
        //gives toast notification on Error.
        const addDefaultCategoryError = new ShowToastEvent({
          title: "Error!",
          message: "Error in adding default category!",
          variant: "error"
        });
        this.dispatchEvent(addDefaultCategoryError);
      });
    this.expenseCategory = this.defaultExpenseCategory;
  }   
   /*
    * @desc to create expense record in the Custom Expense_Record__c Object.
    * @param event.
    * @return nothing.
    */ 
  createExpenseHandler() {
    //console.log('Inside createExpense() function');
    //console.log("this.amount :" + this.amount);
    //checks if entered amount value is undefined or an empty string.
    if (this.amount == undefined || this.amount == "") {
      //gives toast notification on Error.
      const inputFieldMissing = new ShowToastEvent({
        title: "Input Field Missing",
        message: "Please enter some data",
        variant: "error"
      });
      this.dispatchEvent(inputFieldMissing);
    }
    //checks if current date value, category value, amount value is not null.
    else if (
      this.currentDate != null &&
      this.expenseCategory != null &&
      this.amount != null &&
      this.amount >this.MIN_RANGE &&
      this.amount < this.MAX_RANGE &&
      this.amount != ""
    ) {
      //defining key-value pairs in a object for the required fields to be used in creating record.
      const fields = {
        "PSI_DEM__ExpenseDate__c": this.currentDate,
        "PSI_DEM__ExpenseCategory__c": this.expenseCategory,
        "PSI_DEM__ExpenseAmount__c": this.amount,
        "PSI_DEM__ExpenseRemarks__c": this.remarks
      };
      //console.log(fields);
      //storing the object and related field location in a variable.
      const recordInput = { apiName: "PSI_DEM__Expense_Record__c", fields };
      //console.log('Record Input' + recordInput);
      //creating record in the Org Object using createRecord Api.
      createRecord(recordInput)
        .then((response) => {
          //console.log('Expense has been added successfully :',response.id);
          //to invoke getSelectedDateExpenses() function.
          this.dataModifier = this.dataModifier + 1;
          //console.log('Data Modifier Value' + this.dataModifier);
          //gives toast notification on Success.
          const showCreateRecordSuccess = new ShowToastEvent({
            title: "Success!",
            message: "Expense record has been added successfully",
            variant: "Success"
          });
          this.dispatchEvent(showCreateRecordSuccess);
          this.remarks = "";
          this.amount = null;
          this.expenseCategory = this.defaultExpenseCategory;
        })
        .catch((error) => {
          //gives toast notification on Error.
          const showCreateRecordError = new ShowToastEvent({
            title: "Error!",
            message: "Please enter the valid data",
            variant: "error"
          });
          this.dispatchEvent(showCreateRecordError);
          //console.log('Error in adding expense: ',error.body.message);
        });
    } else {
      //checks for invalid data in amount input field and gives toast notification of invalid data error.
      if (this.amount<this.MIN_RANGE || this.amount>this.MAX_RANGE) {
        //gives toast notification on Error for invalidDataError.
        const invalidDataError = new ShowToastEvent({
          title: "Invalid Data",
          message: "Please enter the valid data",
          variant: "error"
        });
        this.dispatchEvent(invalidDataError);        
      } else {
        //gives toast notification on Error for inputFieldMissing.
        const inputFieldMissing = new ShowToastEvent({
          title: "Input Field Missing",
          message: "Please enter the valid data",
          variant: "error"
        });
        this.dispatchEvent(inputFieldMissing);
      }
    }
  }
      
  settingsHandler() {
    //console.log('Inside settingsHandler() function');
    this.showHomeOrSettingsPage = false;
  }  
   /*
    * @desc to Add default currency chosen by user to the default currency custom field in the Org.
    * @param event.
    * @return nothing.
    */ 
  currencyTypeChangeHandler(event) {
    //console.log('Inside currencyTypeChangeHandler() function');
    //assigns selected value of currency to a variable.
    this.currencyType = event.target.value;
    //takes out currency symbol from the string variable "currencyType".
    this.currencySymbol = this.currencyType.substr(0,this.currencyType.indexOf(" "));
    //function accepts default currency value and saves in custom settings in the Org.
    //calls function written in apex class with a parameter carrying the default currency input value.
    addDefaultCurrencyValue({ defaultCurrencyValue: this.currencyType })
      .then((result) => {
        if (result) {
          //console.log('Inside addDefaultCurrencyValue() if section, value returned successfully');
        } else {
          //console.log('ERROR in addDefaultCurrencyValue() function, value not recieved.');
        }
      })
      .catch((error) => {
        //console.log('ERROR in addDefaultCurrencyValue() function, value not recieved.');
      });
  } 
   /*
    * @desc accepts new category input field value and saves in a variable.
    * @param event.
    * @return nothing.
    */ 
  newExpenseCategoryHandler(event) {
    //console.log('Inside newExpenseCategoryHandler() function');
    this.newExpenseCategory = event.target.value;
  }
   /*
    * @desc to Add default category entered by user to the default category custom field in the Org.
    * @param event.
    * @return nothing.
    */ 
  addNewCategoryHandler(event) {
    //console.log('Inside addNewCategoryHandler() function');
    if (this.newExpenseCategory != null) {
      //checks if length of new category input value is grater than two.
      if (this.newExpenseCategory.length > 2) {       
       /*
        * @desc accepts new category value and saves in custom settings in the Org.
        *       calls function written in apex class with a parameter carrying the new category input value.
        * @param no parameter.
        * @return nothing.
        */
        addNewCategoryValue({ newCategoryValue: this.newExpenseCategory })
          .then((result) => {
            if (result) {
              //console.log('INSIDE addNewCategoryValue() function.' + result);
              //gives toast notification on Success.
              const addNewCategorySuccess = new ShowToastEvent({
                title: "Success",
                message: "Category added successfully!",
                variant: "Success"
              });
              this.dispatchEvent(addNewCategorySuccess);
              //to invoke getCategoryPicklistValues() function.
              this.dataModifierPicklistValue =
                this.dataModifierPicklistValue + 1;
              this.newExpenseCategory = "";
            } else {
              //gives toast notification on Error.
              const categoryAlreadyExistsError = new ShowToastEvent({
                title: "Error!",
                message: "Category already exists !",
                variant: "error"
              });
              this.dispatchEvent(categoryAlreadyExistsError);
            }
          })
          .catch((error) => {
            //gives toast notification on Error.
            const addNewCategoryError = new ShowToastEvent({
              title: "Error!",
              message: "Error in adding new category!",
              variant: "error"
            });
            this.dispatchEvent(addNewCategoryError);
          });
      }
      //assigns null to newExpenseCategory variable if length of new category input value is less than three.
      else {
        this.newExpenseCategory = null;
      }
    } else {
      //gives toast notification on Error (null value).
      const invalidData = new ShowToastEvent({
        title: "Invalid Data!",
        message: "Please enter the valid data",
        variant: "error"
      });
      this.dispatchEvent(invalidData);
    }
  } 
   /*
    * @desc to switch between Home page and settings page on click of "BACK" button, 
    *       it sets showHomeOrSettingsPage value to true or false in the html.  
    * @param no parameter.
    * @return nothing.
    */
  backToExpensePageHandler() {
    //console.log('Inside backToExpensePageHandler() function');
    this.showHomeOrSettingsPage = true;
  }  
   /*
    * @desc to get records of specific dates from the org.
    * @param error, data - recieves error or data values depending uppon the response of apex class funtion.
    * @return nothing.
    */ 
  @wire(getSelectedDateExpenses, {
    currentDate: "$currentDate",
    dataModifier: "$dataModifier",
    defaultSymbol: "$currencySymbol"
  })
  wiredExpenses({ error, data }) {
    //console.log('Inside getSelectedDateExpenses() function');
    if (data) {
      //assigns list of string containing selected date records, returned from apex class funtion to dataOfGetSelectedDateExpenses variable.
      this.dataOfGetSelectedDateExpenses = data;
      console.log('dataOfGetSelectedDateExpenses:' + JSON.stringify(this.dataOfGetSelectedDateExpenses, null, '\t'));
      //initialize sumExpense value to zero.
      this.sumExpense = 0;
      //iterates over each record and adds expense amount for the list coming in dataOfGetSelectedDateExpenses variable.
      for (const expRecord of this.dataOfGetSelectedDateExpenses) {
        //console.log('expRecord.PSI_DEM__ExpenseAmount__c: '+expRecord.PSI_DEM__ExpenseAmount__c);
        this.sumExpense = this.sumExpense + expRecord.PSI_DEM__ExpenseAmount__c;
        //console.log('this.sumExpense: '+this.sumExpense);
      }
      //rounding off the sum total of expenses to two decimal places.
      this.sumExpense = this.sumExpense.toFixed(2);
      //console.log('this.sumExpense after fix: '+this.sumExpense);
    } else if (error) {
      //console.log('Error in getSelectedDateExpenses() function');
    }
  } 
   /*
    * @desc accepts date input value and assigns to a variable.
    * @param event.
    * @return nothing.
    */ 
  selectedDateChangeHandler(event) {
    //console.log('Inside selectedDateChangeHandler() function');
    this.selectedDate = event.target.value;
    //console.log(this.selectedDate);
  }  
   /*
    * @desc accepts delete input value and deletes it from the custom setting in the Org.
    * @param event.
    * @return nothing.
    */   
  deleteValueHandler(event) {
    //console.log('Inside deleteValueHandler() function');
    var selectedRow = event.currentTarget;
    //gets the ID of selected row in the "Available Category" list in the settings page and assigns it to key variable.
    var key = selectedRow.dataset.id;
    //console.log('KEY VALUE' + key);
    //console.log(this.categories[key].value);
    //extract the value to be deleted from categories array using key variable as it's index.
    const deleteParaValue = this.categories[key].value;   
   /*
    * @desc accepts category value to be deleted and removes it in the custom settings of the Org. 
    *       calls function written in apex class with a parameter carrying the value to be deleted.
    * @param String categoryToDelete - string value of the selected category by user.
    * @return nothing.
    */
   if(deleteParaValue == this.defaultExpenseCategory)
   {      
      const defaulCategoryDeleteError = new ShowToastEvent({
      title: "Error!",
      message: "Cannot delete default category! To delete, change default category",
      variant: "error"
    });
      this.dispatchEvent(defaulCategoryDeleteError);      
   }
   else 
   {   
      deleteCategoryValue({ categoryToDelete: deleteParaValue })
        .then((result) => {
          if (result) {
            //gives toast notification on Success.
            const deleteCategorySuccess = new ShowToastEvent({
              title: "Success",
              message: "Category deleted successfully!",
              variant: "Success"
            });
            this.dispatchEvent(deleteCategorySuccess);
          }
          //to invoke getCategoryPicklistValues() function.
          this.dataModifierPicklistValue = this.dataModifierPicklistValue + 1;
        })
        .catch((error) => {
          //gives toast notification on Error.
          const addNewCategoryError = new ShowToastEvent({
            title: "Error!",
            message: "Error while deleting category!",
            variant: "error"
          });
          this.dispatchEvent(addNewCategoryError);
        });
   }
  }
}
