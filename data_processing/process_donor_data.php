<?php
$spreadsheet_id = "1EdytjedGJx8YaQw9he5vAkhp4eUGUPIdrXr9KfG1lJA";
$google_sheets_url = "https://spreadsheets.google.com/feeds/list/{$spreadsheet_id}/od6/public/values?alt=json\n\n";

$display_name_key = 'gsx$displayname';
$text_key = '$t';
$search_name_key = 'gsx$searchname';
$category_key = 'gsx$category';

$raw_donor_list = array();

require 'Osmek.php';

$config = array(
    'account_api_key' => 'x2lGtBEvpPMzg6jsfIawXu0De8NkYSVn', 
    'cache_feeds' => false
);


try{
	$global_osmek = new Osmek($config);

	echo "\n\nStarting Google Docs to Osmek Importer Script\n\n";

	echo "Getting Osmek Data\n\n";

	$osmek_categories = getOsmekCategories($global_osmek);

	echo "Found Osmek Categories:\n\n";

	foreach($osmek_categories as $cat):
		echo $cat->title;
		echo "\n";
	endforeach;

	echo "\n\n";

	echo "Getting Osmek Donors\n\n";
	$osmek_donors = getOsmekDonors($global_osmek);
	$osmek_donor_count = count($osmek_donors);

	echo "Found {$osmek_donor_count} existing donors\n\n";


	echo "Pulling JSON from: {$google_sheets_url}\n\n";


	$json_string = getDataStringFromURL($google_sheets_url);

	echo "Data Retrived from URL\n\n";
	$json_obj = json_decode($json_string);

	$data_list = $json_obj->feed->entry;

	$item_count = count($data_list);
	echo "Data Received: {$item_count} items\n\n";

	$limit = 1000;
	$i = 0;
	foreach($data_list as $data_obj):
		$donor = new StdClass();

		$donor->display_name = $data_obj->$display_name_key->$text_key;
		$donor->search_name = $data_obj->$search_name_key->$text_key;
		$donor->category = $data_obj->$category_key->$text_key;

		$raw_donor_list[] = $donor;
		if($i++ > $limit):
			break;
		endif;
	endforeach;


	foreach($raw_donor_list as $raw_donor):
		// echo "Processing Donor\n";
		// var_dump($raw_donor);
		$donor_cat = $raw_donor->category;
		$osmek_data_item = array('donor_type' => 'donor');

		$donor_cat_key = getKeyForString($donor_cat);

		// echo "Donor Cat Key: {$donor_cat_key}\n\n";

		if(! isset($osmek_categories[$donor_cat_key])):
			echo "Category not found: {$donor_cat_key}\n";
			continue;
		else:
			// echo "Category Found!";
		endif;
		// echo "\n\n";

		$osmek_data_item['title'] = $raw_donor->display_name;
		$osmek_data_item['search_name'] = $raw_donor->search_name;

		$osmek_data_item['categories'] = $osmek_categories[$donor_cat_key]->url_title;

		$existing_object = checkForExistingOsmekObject($osmek_donors, $osmek_data_item);

		$donor_section_id = 10821;

		if($existing_object):
			// $existing_object->title = $raw_donor->display_name;
			// $existing_object->search_name = $raw_donor->search_name;
			// $existing_object->categories = new StdClass();

			// $new_cat_key = $osmek_categories[$donor_cat_key]->url_title;

			// $existing_object->categories->$new_cat_key = $osmek_categories[$donor_cat_key];


			// $existing_object->category_string = $osmek_categories[$donor_cat_key]->title;

			$existing_object->categories = $osmek_categories[$donor_cat_key]->url_title;

			echo "Existing Record Found, Updating\n";
			echo $existing_object->title;
			// echo $existing_object->id;

			$global_osmek->update($donor_section_id, $existing_object->id, $osmek_data_item);

			// exit;

		else:
			echo "Creating new record: \n";
			echo $osmek_data_item['title'];
			$global_osmek->create($donor_section_id, $osmek_data_item);

			// var_dump($osmek_data_item);

		endif;
		echo "\n\n";

	endforeach;

}
catch(Exception $e){
	echo "Exception!";
	var_dump($e);
	exit;
}

function checkForExistingOsmekObject($osmek_donors, $input_data){
	foreach($osmek_donors as $osmek_donor):

		// echo $input_data['title'].":".$osmek_donor->title;
		// echo "\n\n";
		if($osmek_donor->title == $input_data['title']):
			echo "Match Found\n";
			return $osmek_donor;
		endif;
	endforeach;
	return false;
}

function getKeyForString($input){
	$input = strtoupper($input);
	$input = str_replace(' ', '', $input);
	$input = str_replace('-', '', $input);
	$input = str_replace('.', '', $input);
	$input = str_replace("'", '', $input);
	$input = str_replace('"', '', $input);
	return $input;
}

function getOsmekCategories($osmek){
	$donor_section_id = 10821;

	$section_info = json_decode($osmek->section_info($donor_section_id) );

	$osmek_categories = array();

	foreach($section_info->categories as $cat):
		$donor_cat_key = getKeyForString($cat->title);

		$osmek_categories[$donor_cat_key] = $cat;
	endforeach;

	return $osmek_categories;
}

function getOsmekDonors($osmek){
	$donor_section_id = 10821;

	$donor_data = json_decode($osmek->fetch_json($donor_section_id) );

	$donor_array = array();

	foreach($donor_data->items as $donor):
		if($donor->donor_type == 'donor'):
			$donor_array[] = $donor;
		endif;
	endforeach;

	return $donor_array;
}

function getDataStringFromURL($url){
	// make request
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url); 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	$output = curl_exec($ch);   
	return $output;
}
