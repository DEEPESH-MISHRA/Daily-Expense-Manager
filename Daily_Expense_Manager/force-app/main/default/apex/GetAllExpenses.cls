// /** 
//   * @desc this class will contains functions which will fetch data from the Org and return it to our js class,
//   * or take input given by user from the js class functions and save that in the Org data.
//   * examples include getAllExpenses(), getSelectedDateExpenses(), getCategoryPicklistValues(), addNewCategoryValue() etc.
//   * @author 
//   * @required daily_Expense_Manager.js, daily_Expense_Manager.html, daily_Expense_Manager.js-meta.xml
// */
public with sharing class GetAllExpenses {  
    /*
     * @desc to fetch all the records present in our object in the backend.
     * @param no parameter.
     * @return List of Expense Record type.
     */ 
    //  @AuraEnabled(cacheable=true)
    //  public static List<Expense_Record__c> getAllExpenses()
    //  {
    //      //System.debug('Inside getAllExpenses Apex Class');
    //      return [SELECT Id, Name ,ExpenseDate__c, ExpenseCategory__c ,ExpenseAmount__c ,ExpenseRemarks__c from Expense_Record__c];
 
    //  }  
    /*
     * @desc to fetch all records of a particular date.
     * @param Date - currentDate, Integer - dataModifier, String-defaultSymbol.
     * @return List of Expense Record type.
     */ 
     @AuraEnabled(cacheable=true)
     public static List<Expense_Record__c> getSelectedDateExpenses(Date currentDate, Integer dataModifier, String defaultSymbol)
     {
         List<Expense_Record__c> newListOfExpenses = new List<Expense_Record__c>();
         Integer srNo = 1;  
         // To make sure we can update the database (APEXCRUD Rules)
         if (!Schema.sObjectType.Expense_Record__c.isAccessible()) {
            return null;
        }

         //      
         List<Expense_Record__c> listOfExpenses = [SELECT Id, Sr_no__c,Default_Currency__c, Name ,ExpenseDate__c, ExpenseCategory__c ,ExpenseAmount__c ,ExpenseRemarks__c from Expense_Record__c where ExpenseDate__c=:currentDate  order by CreatedDate asc ];
         //concating currency symbol with amount value and inserting serial number and adding in a list.
         for(Expense_Record__c expRecord: listOfExpenses) {
             expRecord.Default_Currency__c = defaultSymbol + ' ' + String.valueOf(expRecord.ExpenseAmount__c);
             expRecord.Sr_no__c = String.valueOf(srNo);
             srNo++;
             newListOfExpenses.add(expRecord);
         }        
         return newListOfExpenses;
     }    
    /*
     * @desc to fetch list of Category values in a drop down field from our custom settings field in the back end.
     * @param Integer - dataModifier.
     * @return List of String - Category values.
     */  
     @AuraEnabled(cacheable=true)
     public static List<String> getCategoryPicklistValues(Integer dataModifier) 
     {    
         //geting values of Expense_Category_Values__c Custom setting Object's 'Expense Pick Value' field.        
         Expense_Category_Values__c expenseValues= Expense_Category_Values__c.getValues('Expense Pick Value');
         //if expenseValues contains the value, then converts it in a List of String and return.
         if(expenseValues.Expense_Picklist_Values__c !=null) {
             //System.debug('expenseValues :' + expenseValues.Expense_Picklist_Values__c);
             List<String> lstExpValues = expenseValues.Expense_Picklist_Values__c.split(',');
             //System.debug('lstExpValues :' + lstExpValues);
             return lstExpValues;
         }
         //else return a empty List of String. 
         else{
             List<String> lstExpValues = new List<String>{''};
             return lstExpValues;
         }                  
     }   
    /*
     * @desc to ADD new category value in the custom setting field of the Org.
     * @param String - newCategoryValue.
     * @return Boolean - Success or failure.
     */  
     @AuraEnabled(cacheable=false)
     public static Boolean addNewCategoryValue(String newCategoryValue)
     {   
             //geting instance of Expense_Category_Values__c Custom setting Object. 
             Expense_Category_Values__c newExpenseInstance = Expense_Category_Values__c.getInstance('Expense Pick Value');
             //Checks for the already present values and checks if newCategoryValue parameter value is not null
             if(newCategoryValue!=null && newExpenseInstance.Expense_Picklist_Values__c != null)
                 {                   
                     String[] catCompareString = newExpenseInstance.Expense_Picklist_Values__c.split(',');
                     //checking whether Category already exists or not.
                         for(String catValue : catCompareString)
                         {
                             //if value already exists returns false.
                         if(catValue.toLowerCase()== newCategoryValue.toLowerCase())
                                 {                            
                                 //System.debug('Inside check wheather category already exists :'  );
                                 return false;  
                                 }
                     }
                     //concating new category value to the alreay existing category values.
                     newExpenseInstance.Expense_Picklist_Values__c = newExpenseInstance.Expense_Picklist_Values__c + ',' + newCategoryValue;                   
                     //System.debug('NEW ExpValues :' +   newExpenseInstance.Expense_Picklist_Values__c);
                     //updating the current Custom Setting Category field of the Org.
                     // To make sure we can update the database (APEXCRUD Rules)
                    if (!Schema.sObjectType.Expense_Category_Values__c.fields.Expense_Picklist_Values__c.isUpdateable()) {
                         null;
                        }
                     update newExpenseInstance;
                     return true; 
                 }
             //if no value exists then adds a new category value.
             else {
                 if(newCategoryValue==null)
                 {
                     return false;
                 }
                 else{
                     newExpenseInstance.Expense_Picklist_Values__c = newCategoryValue;
                             update newExpenseInstance;
                             return true;
                 }
                 } 
             
     }    
    /*
     * @desc to DELETE category value from the list diaplayed in the settings page.
     * @param String - categoryToDelete.
     * @return Boolean - Success or failure.
     */ 
     @AuraEnabled(cacheable=false)
     public static Boolean deleteCategoryValue(String categoryToDelete) 
     {   
         //checks if categoryToDelete parameter value is not null.
         if(categoryToDelete!=null)
         {
             //System.debug('NEW VALUE'+ categoryToDelete);
             //geting values of Expense_Category_Values__c Custom setting Object's 'Expense Pick Value' field.       
             Expense_Category_Values__c expenseValues= Expense_Category_Values__c.getValues('Expense Pick Value');
             //System.debug('expenseValues :' + expenseValues.Expense_Picklist_Values__c);        
             String commaRemoved = expenseValues.Expense_Picklist_Values__c.remove(',');
             String finalValue = '';  
             // To make sure we can update the database (APEXCRUD Rules)
             if (!Schema.sObjectType.Expense_Category_Values__c.fields.Expense_Picklist_Values__c.isCreateable()) 
             {
                 return null;
             }     
             if(commaRemoved.startsWithIgnoreCase(categoryToDelete))
             {
                 finalValue = expenseValues.Expense_Picklist_Values__c.substringAfter(categoryToDelete +',');             
                 //System.debug('finalValue----'+finalValue);
                 expenseValues.Expense_Picklist_Values__c = finalValue;
                 upsert expenseValues ;          
                 }
             else if(commaRemoved.endsWithIgnoreCase(categoryToDelete)){
                 finalValue = expenseValues.Expense_Picklist_Values__c.substringBefore(','+categoryToDelete);
                 //System.debug('finalValue----'+finalValue);
                 expenseValues.Expense_Picklist_Values__c = finalValue;
                 upsert expenseValues ; 
             }
             else{
                 finalValue = expenseValues.Expense_Picklist_Values__c.substringBefore(','+categoryToDelete)+expenseValues.Expense_Picklist_Values__c.substringAfter(categoryToDelete);
                 //System.debug('finalValue----'+finalValue);
                 expenseValues.Expense_Picklist_Values__c = finalValue;
                 upsert expenseValues ; 
             }        
             return true;
         }
         else {
             return false;
         }
     }  
    /*
     * @desc to ADD DEFAULT CATEGORY value to the custom setting field in the back end.
     * @param String - defaultCategoryValue.
     * @return Boolean - Success or failure.
     */ 
     @AuraEnabled(cacheable=false)
     public static Boolean addDefaultCategoryValue(String defaultCategoryValue)
     {
         //geting instance of Expense_Category_Values__c Custom setting Object. 
         Expense_Category_Values__c newExpenseInstance = Expense_Category_Values__c.getInstance('Expense Pick Value');       
         if(defaultCategoryValue != null)
           {      
                 //assigns the defaultCategoryValue parameter value to the custom setting field of Default Category.  
                 newExpenseInstance.Default_Category__c = defaultCategoryValue;                   
                 //System.debug('DEFAULT CATEGORY VALUE :' +    newExpenseInstance.Default_Category__c);
                 //updates the value of Custom Setting Default Category field.
                 update newExpenseInstance;
                 return true; 
          }        
         else 
         {
                 return false;
         }     
     }  
    /*
     * @desc to fetch Default category value from the custom settings in the back end.
     * @param Integer - dataModifier.
     * @return List of String - default Category value.
     */ 
     @AuraEnabled(cacheable=true)
     public static List<String> fetchDefaultCategoryValue(Integer dataModifier)
     {
         //geting instance of Expense_Category_Values__c Custom setting Object.
         Expense_Category_Values__c newExpenseInstance = Expense_Category_Values__c.getInstance('Expense Pick Value');
         if(newExpenseInstance.Default_Category__c != null)
          {        
                 String newStringValue = newExpenseInstance.Default_Category__c;      
                 //System.debug('FETCH CATEGORY VALUE :' + newExpenseInstance.Default_Category__c);  
                 //System.debug('FETCH CATEGORY VALUE STRING :' + newStringValue);
                 List<String> newList = new List<String>();
                 newList.add(newExpenseInstance.Default_Category__c);                
                 return newList;           
         }        
         else 
        {
         return null;
        }    
     }   
    /*
     * @desc to ADD default currency value in the custom setting field in the back end.
     * @param String - defaultCurrencyValue.
     * @return Boolean - Success or failure.
     */ 
     @AuraEnabled(cacheable=false)
     public static Boolean addDefaultCurrencyValue(String defaultCurrencyValue)
     {
         //geting instance of Expense_Category_Values__c Custom setting Object.
         Expense_Category_Values__c newExpenseInstance = Expense_Category_Values__c.getInstance('Expense Pick Value');
         if(defaultCurrencyValue != null)
           {     
                 //assigns the defaultCurrencyValue parameter value to the custom setting field of Default Currency.          
                 newExpenseInstance.Default_Currency__c = defaultCurrencyValue;
                 //System.debug('DEFAULT CURRENCY VALUE :' +    newExpenseInstance.Default_Currency__c);
                 //updates the value of Custom Setting Default Currency field.
                 update newExpenseInstance;
                 return true; 
           }         
         else 
         {
                 return false;
         }     
     }  
    /*
     * @desc to fetch default currency value from the custom setting field in the back end.
     * @param Integer - dataModifier.
     * @return List of String - default currency value.
     */ 
      @AuraEnabled(cacheable=true)
      public static List<String> fetchDefaultCurrencyValue(Integer dataModifier)
      {
          //geting instance of Expense_Category_Values__c Custom setting Object.
          Expense_Category_Values__c newExpenseInstance = Expense_Category_Values__c.getInstance('Expense Pick Value');
          if(newExpenseInstance.Default_Currency__c != null)
           {        
                  String newStringValue = newExpenseInstance.Default_Currency__c;      
                  //System.debug('FETCH CURRENCY VALUE :' + newExpenseInstance.Default_Currency__c);  
                  //System.debug('FETCH CURRENCY VALUE STRING :' + newStringValue);
                  List<String> newList = new List<String>();
                  newList.add(newExpenseInstance.Default_Currency__c);                
                  return newList;           
          }        
          else 
         {
          return null;
         }     
      }  
    /*
     * @desc function to be called on load to check whether Custom setting object is present or not.
     *       if not present then creates a new custom setting object and assings default values.
     * @param no parameter.
     * @return Boolean - Success or failure.
     */ 
     @AuraEnabled(cacheable=false)
     public static Boolean initializeCustomSettingValues()
     {
        //geting values of Expense_Category_Values__c Custom setting Object.
         Expense_Category_Values__c expenseValues= Expense_Category_Values__c.getValues('Expense Pick Value');
         //if initially Custom Setting Object is not present, then creates custom setting Object with values.
         if(expenseValues == null)
         {
         //creates a new Custom Setting Object in the Org.
         Expense_Category_Values__c objectOfCustomSetting = new Expense_Category_Values__c ();       
         objectOfCustomSetting.name = 'Expense Pick Value';
         //setting default value for Category and Currency Custom field in the Org.
         objectOfCustomSetting.Default_Category__c = 'Food';
         objectOfCustomSetting.Default_Currency__c = '$ (United States)';
         //setting default value for expense category's picklist values.
         objectOfCustomSetting.Expense_Picklist_Values__c = 'Food,Travel,Accommodation,Others';       
         //inserts the new Object with values in the Org.   
         insert objectOfCustomSetting;
         return false;
         }
     return true;
     }  
 
 }
 