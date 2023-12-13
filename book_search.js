/** 
 * RECOMMENDATION
 * 
 * To test your code, you should open "tester.html" in a web browser.
 * You can then use the "Developer Tools" to see the JavaScript console.
 * There, you will see the results unit test execution. You are welcome
 * to run the code any way you like, but this is similar to how we will
 * run your code submission.
 * 
 * The Developer Tools in Chrome are available under the "..." menu, 
 * futher hidden under the option "More Tools." In Firefox, they are 
 * under the hamburger (three horizontal lines), also hidden under "More Tools." 
 */

/**
 * Searches for matches in scanned text.
 * @param {string} searchTerm - The word or term we're searching for. 
 * @param {JSON} scannedTextObj - A JSON object representing the scanned text.
 * @returns {JSON} - Search results.
 * */ 
 function findSearchTermInBooks(searchTerm, scannedTextObj) { 
    var result = {
        "SearchTerm": searchTerm.trim(),
        "Results": []
    };
    var resultList = result.Results
    searchTerm = searchTerm.trim(); // removes whitespace
    
    // check for Error in input
    // will print what caused the error, but the text match will still run.
    validate_inputs(searchTerm, scannedTextObj);

    // loop through all books and each scanned line to determine match
    for (var bookNum = 0; bookNum < scannedTextObj.length; bookNum++){
        var book = scannedTextObj[bookNum];
        for (var contentNum = 0; contentNum < book.Content.length; contentNum++){
            var content = book["Content"][contentNum];
            var textLine = content["Text"];
            var page = content["Page"];
            var line = content["Line"];
            
            // splits textline into an array of words
            var textListUnfiltered = textLine.split(/[ ,.;"?!]/); 
            var textList = textListUnfiltered.filter(element => element !=='');
            
            // Check for End-of-line hyphenation
            if ((textLine[textLine.length - 1] == "-") && (contentNum < book.Content.length - 1)){
                if (hyphen_search(searchTerm, 
                                textList[textList.length - 1], 
                                page, 
                                line, 
                                book["Content"][contentNum+1])){
                    resultList.push({"ISBN" : book.ISBN,
                                     "Page" : page,
                                     "Line" : line});       
                }
            }

            // normal linear search
            if (linear_search(searchTerm, textList)){
                resultList.push({"ISBN" : book.ISBN,
                                 "Page" : page,
                                 "Line" : line});
            }
        }
    }

    return result;
}

/**
 * Uses linear Search to search for word in array.
 * @param {string} searchTerm - The word or term we're searching for. 
 * @param {array} textList - An array representing the text of a single line of scanned text.
 * @returns {boolean} - True if match is found, False if match is not found.
 * */ 
function linear_search(searchTerm, textList){
    for (var wordNum = 0; wordNum < textList.length; wordNum++){
        if (searchTerm == textList[wordNum]){
            return true;
        }
    }
    
    return false;
}

/**
 * Checks hyphenated words.
 * @param {string} searchTerm - The word or term we're searching for. 
 * @param {string} text - A string representing last word of the line of text.
 * @param {number} page - A number representing the page.
 * @param {number} line - A number representing the line number.
 * @param {JSON} nextLine - A JSON object representing the scanned text following textList1.
 * @returns {boolean} - True if match is found, False if match is not found.
 * */ 
function hyphen_search(searchTerm, text, page, line, nextLine){
    var updatedText;
    var nextWord;

    // verifies the following scanned text is the next line or the first line of the next page
    if((nextLine.Page == page && nextLine.Line == line + 1) || (nextLine.Page == page + 1 && nextLine.Line ==  1)){
        updatedText = text.split("-")[0];
        nextWord = (nextLine.Text.split(/[ ,.;"?!]/))[0];
    } else {
        return false;
    }

    return ((updatedText + nextWord) == searchTerm);
}
    
/**
 * Checks for errors in input
 * @param {string} searchTerm -  The word or term we're searching for
 * @param {JSON} scannedTextObj - A JSON object representing the scanned text.
 * @returns {boolean} - True if there contains an error, false if there is no error.
 * */ 
function validate_inputs(searchTerm, scannedTextObj){
    // searchTerm can only be one string
    if (/\s/.test(searchTerm)){
        console.log(`Error: Search term can only be one word`);
    }
    // ISBN cannot include letters other than 'X'
    for (var bookNum = 0; bookNum < scannedTextObj.length; bookNum++){
        var isbn = scannedTextObj[bookNum].ISBN;
        if (/[a-wyz]/i.test(isbn) == true){
            console.log(`Error: ISBN "${isbn}" contains letter(s)`);
            return true;
        }
        // Line number should not contain any letters
        for (var contentNum = 0; contentNum < scannedTextObj[bookNum].Content.length; contentNum++){
            var line = scannedTextObj[bookNum].Content[contentNum].Line;
            if ((/[a-zA-Z]/.test(scannedTextObj[bookNum].Content[contentNum].Line)) == true){
                console.log(`Error: Line number "${line}" contains letter(s)`);
                return true;
            }
        }
    }

    return false;
}


/*
* ------------------------------TEST INPUT OBJECTS ------------------------------------                                                  
*/

/** Example input object. */
const twentyLeaguesIn = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 9,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
            {
                "Page": 31,
                "Line": 10,
                "Text": "eyes were, I asked myself how he had managed to see, and"
            } 
        ] 
    }
]

/** input object with multiple end-of-line hyphens. */
const testBookMultipleHyphens = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 9,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
            {
                "Page": 33,
                "Line": 10,
                "Text": "eyes were, I asked. dark-"
            },
            {
                "Page": 33,
                "Line": 11,
                "Text": "ness was then profound; and however good the Canadian\'s"
            }
        ] 
    }
]

/** input object content contains a skip line following an end-of-line hyphen*/
const testBookSkipLine = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 10,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
            {
                "Page": 31,
                "Line": 11,
                "Text": "eyes were, I asked myself how he had managed to see, and"
            } 
        ] 
    }
]

/** input object containing no content in book*/
const testBookZeroContent = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [] 
    }
]

/** input object containing no book(s)*/
const testBookZeroBooks = []

/** input object containing errors in ISBN and Line */
const testIsbnLineErrorCheck = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000s52531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 9,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
            {
                "Page": 31,
                "Line": 10,
                "Text": "eyes were, I asked myself how he had managed to see, and"
            } 
        ] 
    }
]

/*
* -----------------------------TEST OUTPUT OBJECTS -------------------------------------                                                   
*/

/** Example output object */
const twentyLeaguesOut = {
    "SearchTerm": "the",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 9
        }
    ]
}

/** Test3 output object */
const test3PeriodOut = {
    "SearchTerm": "momentum",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        }
    ]
}

/** Test4 output object */
const test4ApostropheOut = {
    "SearchTerm": "Canadian's",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 9
        }
    ]
}

/** Test5 output object */
const test5HyphenOut = {
    "SearchTerm": "darkness",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        },
    ]
}

/** Test6 output object */
const test6MultipleHyphenOut = {
    "SearchTerm": "darkness",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        },
        {
            "ISBN": "9780000528531",
            "Page": 33,
            "Line": 10
        }
    ]
}

/** Test7 output object */
const test7SkipHyphenOut = {
    "SearchTerm": "darkness",
    "Results": []
}

/** Test8 output object */
const test8NoContentOut = {
    "SearchTerm": "darkness",
    "Results": []
}

/** Test9 output object */
const test9NoBooksOut = {
    "SearchTerm": "noBook",
    "Results": []
}

/** Test10 output object */
const test10CaseSenseOut = {
    "SearchTerm": "The",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        },
    ]
}
/** Test11 output object */
const test11WhitespaceOut = {
    "SearchTerm": "The",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 8
        },
    ]
}

/** Test12 output object */
const test12CheckErrorOut = {
    "SearchTerm": "The",
    "Results": [
        {
            "ISBN": "9780000s52531",
            "Page": 31,
            "Line": 8
        },
    ]
}
/*
 _   _ _   _ ___ _____   _____ _____ ____ _____ ____  
| | | | \ | |_ _|_   _| |_   _| ____/ ___|_   _/ ___| 
| | | |  \| || |  | |     | | |  _| \___ \ | | \___ \ 
| |_| | |\  || |  | |     | | | |___ ___) || |  ___) |
 \___/|_| \_|___| |_|     |_| |_____|____/ |_| |____/ 
                                                      
 */

/* We have provided two unit tests. They're really just `if` statements that 
 * output to the console. We've provided two tests as examples, and 
 * they should pass with a correct implementation of `findSearchTermInBooks`. 
 * 
 * Please add your unit tests below.
 * */

/** We can check that, given a known input, we get a known output. */
const test1result = findSearchTermInBooks("the", twentyLeaguesIn);
if (JSON.stringify(twentyLeaguesOut) === JSON.stringify(test1result)) {
    console.log("PASS: Test 1");
} else {
    console.log("FAIL: Test 1");
    console.log("Expected:", twentyLeaguesOut);
    console.log("Received:", test1result);
}

/** We could choose to check that we get the right number of results. */
const test2result = findSearchTermInBooks("the", twentyLeaguesIn); 
if (test2result.Results.length == 1) {
    console.log("PASS: Test 2");
} else {
    console.log("FAIL: Test 2");
    console.log("Expected:", twentyLeaguesOut.Results.length);
    console.log("Received:", test2result.Results.length);
}

/** Checks for words that have a period */
const test3result = findSearchTermInBooks("momentum", twentyLeaguesIn);
if (JSON.stringify(test3PeriodOut) === JSON.stringify(test3result)) {
    console.log("PASS: Test 3 - Checks for words with a period");
} else {
    console.log("FAIL: Test 3 - Checks for words with a period");
    console.log("Expected:", test3PeriodOut);
    console.log("Received:", test3result);
}

/** Checks for a word with an apostrophe  */
const test4result = findSearchTermInBooks("Canadian's", twentyLeaguesIn);
if (JSON.stringify(test4ApostropheOut) === JSON.stringify(test4result)) {
    console.log("PASS: Test 4 - Checks for words with an apostrophe");
} else {
    console.log("FAIL: Test 4 - Checks for words with an apostrophe");
    console.log("Expected:", test4ApostropheOut);
    console.log("Received:", test4result);
}

/** Checks for a word with end-of-line hyphen */
const test5result = findSearchTermInBooks("darkness", twentyLeaguesIn);
if (JSON.stringify(test5HyphenOut) === JSON.stringify(test5result)) {
    console.log("PASS: Test 5 - Checks for a word with end-of-line hyphen");
} else {
    console.log("FAIL: Test 5 - Checks for a word with end-of-line hyphen");
    console.log("Expected:", test5HyphenOut);
    console.log("Received:", test5result);
}

/** Checks for multiple words with end-of-line hyphens */
const test6result = findSearchTermInBooks("darkness", testBookMultipleHyphens);
if (JSON.stringify(test6MultipleHyphenOut) === JSON.stringify(test6result)) {
    console.log("PASS: Test 6 - Checks for multiple words with end-of-line hyphens");
} else {
    console.log("FAIL: Test 6 - Checks for multiple words with end-of-line hyphens");
    console.log("Expected:", test6MultipleHyphenOut);
    console.log("Received:", test6result);
}

/** Checks for end-of-line hyphen that do not numerically follow the line or page number*/
const test7result = findSearchTermInBooks("darkness", testBookSkipLine);
if (JSON.stringify(test7SkipHyphenOut) === JSON.stringify(test7result)) {
    console.log("PASS: Test 7 - Checks for end-of-line hyphen that do not numerically follow the line or page number");
} else {
    console.log("FAIL: Test 7 - Checks for end-of-line hyphen that do not numerically follow the line or page number");
    console.log("Expected:", test7SkipHyphenOut);
    console.log("Received:", test7result);
}

/** Book with no content */
const test8result = findSearchTermInBooks("darkness", testBookZeroContent);
if (JSON.stringify(test8NoContentOut) === JSON.stringify(test8result)) {
    console.log("PASS: Test 8 - Checks for 0 capability. Book with zero content");
} else {
    console.log("FAIL: Test 8 - Checks for 0 capability. Book with zero content");
    console.log("Expected:", test8NoContentOut);
    console.log("Received:", test8result);
}

/** No Book */
const test9result = findSearchTermInBooks("noBook", testBookZeroBooks);
if (JSON.stringify(test9NoBooksOut) === JSON.stringify(test9result)) {
    console.log("PASS: Test 9 - Checks for 0 capability. No books");
} else {
    console.log("FAIL: Test 9 - Checks for 0 capability. No books");
    console.log("Expected:", test9NoBooksOut);
    console.log("Received:", test9result);
}

/** Checks for capital letters */
const test10result = findSearchTermInBooks("The", twentyLeaguesIn);
if (JSON.stringify(test10CaseSenseOut) === JSON.stringify(test10result)) {
    console.log("PASS: Test 10 - Checks case sensitivity");
} else {
    console.log("FAIL: Test 10 - Checks case sensitivity");
    console.log("Expected:", test10CaseSenseOut);
    console.log("Received:", test10result);
}

/** Ignores whitespaces in search term */
const test11result = findSearchTermInBooks("The    ", twentyLeaguesIn);
if (JSON.stringify(test11WhitespaceOut) === JSON.stringify(test11result)) {
    console.log("PASS: Test 11 - Checks for whitespace capability. Ignore whitespaces in searchTerm");
} else {
    console.log("FAIL: Test 11 - Checks for whitespace capability. Ignore whitespaces in searchTerm");
    console.log("Expected:", test11WhitespaceOut);
    console.log("Received:", test11result);
}

/** Checks for errors in ISBN and line numbers */
const test12result = findSearchTermInBooks("The", testIsbnLineErrorCheck);
if (JSON.stringify(test12CheckErrorOut) === JSON.stringify(test12result)) {
    console.log("PASS: Test 12 - Checks for errors in ISBN and line numbers");
} else {
    console.log("FAIL: Test 12 - Checks for errors in ISBN and line numbers");
    console.log("Expected:", test12CheckErrorOut);
    console.log("Received:", test12result);
}
