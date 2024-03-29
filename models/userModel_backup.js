let functions = require('../helpers/functions');
//config = require('.././server/config');

let userModel = {
	
	
	getUserByEmail:function(email){
		var sql = `SELECT A.user_id,A.unique_id,A.dealer_id,
		A.email,A.user_type,A.first_name,A.last_name,A.image,A.address,A.city,A.state_id,A.phone,A.password,A.otp,
		A.office_id,A.region_id,A.division_id
		FROM user_master A 
		WHERE (A.user_type = 4 OR A.user_type = 5 OR A.user_type = 6 OR A.user_type = 7 OR A.user_type = 3) 
		AND A.email = '`+email+`'`;
		return functions.selectQuery(sql);
	},
	getUserDetailsForLogin:function(email){
		var sql = `SELECT A.user_id,A.unique_id,A.dealer_id,A.active,B.prospect_active,B.active as dealeractive,
		(SELECT count(*) FROM map_dealer_vertical WHERE map_dealer_vertical.dealer_id = A.dealer_id AND map_dealer_vertical.product_id = 2 ) as verticalscount,
		A.email,A.user_type,A.first_name,A.last_name,A.image,A.address,A.city,A.state_id,A.phone,A.password,A.otp,
		A.office_id,A.region_id,A.division_id,C.office_title as office_name
		FROM user_master A 
		LEFT JOIN dealer_master B ON B.dealer_id = A.dealer_id
		LEFT JOIN dealer_office C ON C.office_id = A.office_id
		WHERE (A.user_type = 4 OR A.user_type = 5 OR A.user_type = 6 OR A.user_type = 7 OR A.user_type = 3) 
		AND A.email = '`+email+`'`;
		
		return functions.selectQuery(sql);
	},
	getUserDetailsForautoLogin:function(user_id){
		var sql = `SELECT A.user_id,A.unique_id,A.dealer_id,A.active,B.prospect_active,B.active as dealeractive,
		(SELECT count(*) FROM map_dealer_vertical WHERE map_dealer_vertical.dealer_id = A.dealer_id AND map_dealer_vertical.product_id = 2 ) as verticalscount,
		A.email,A.user_type,A.first_name,A.last_name,A.image,A.address,A.city,A.state_id,A.phone,A.password,A.otp,
		A.office_id,A.region_id,A.division_id,C.office_title as office_name
		FROM user_master A 
		LEFT JOIN dealer_master B ON B.dealer_id = A.dealer_id
		LEFT JOIN dealer_office C ON C.office_id = A.office_id
		WHERE (A.user_type = 4 OR A.user_type = 5 OR A.user_type = 6 OR A.user_type = 7 OR A.user_type = 3) 
		AND A.user_id = '`+user_id+`'`;
		return functions.selectQuery(sql);
	},

	getUserInfo:function(user_id){
		var sql = `SELECT A.user_id,A.unique_id,A.dealer_id,
		A.email,A.user_type,A.first_name,A.last_name,A.image,A.address,A.city,A.state_id,A.phone,
		B.area_coordinates,GROUP_CONCAT(B.area_id) as area_id,C.office_title as office_name
		FROM user_master A 
		LEFT JOIN sales_rep_regions B ON B.user_id = A.user_id
		LEFT JOIN dealer_office C ON C.office_id = A.office_id
		WHERE A.user_id = '`+user_id+`' GROUP BY A.user_id`;
		return functions.selectQuery(sql);
	},
	getManagerInfo:function(user_id){
		var sql = `SELECT A.user_id,A.unique_id,A.dealer_id,
		A.email,A.user_type,A.first_name,A.last_name,A.image,A.address,A.city,A.state_id,A.phone,
		B.area_coordinates,B.area_id
		FROM user_master A 
		LEFT JOIN sales_rep_regions B ON B.user_id = A.user_id
		WHERE A.user_id = '`+user_id+`'`;
		return functions.selectQuery(sql);
	},
	getCoordinates:function(area_id){
		var sql = `SELECT A.* FROM manager_regions A WHERE A.area_id IN(`+area_id+`)`;
		return functions.selectQuery(sql);
	},
	getManagerCoordinates:function(manager_id){
		var sql = `SELECT A.* FROM manager_regions A WHERE A.manager_id = `+manager_id;
		return functions.selectQuery(sql);
	},
	getAreaDetails:function(area_id,dealer_id){
		// var sql = `SELECT A.user_id,B.image,B.first_name,B.last_name FROM sales_rep_regions A 
		// LEFT JOIN user_master B ON B.user_id = A.user_id
		// WHERE A.area_id = `+area_id;
		var sql = `SELECT A.*, IF(LENGTH(B.residential_id) = 0,0, (LENGTH(B.residential_id) - LENGTH(REPLACE(B.residential_id, ',', '')) + 1)) as total_home,B.residential_id,
		(SELECT count(*) FROM customer_master C WHERE FIND_IN_SET(C.residential_id ,B.residential_id) AND C.dealer_id = `+dealer_id+` ) as home_interacted
		FROM manager_regions A 
		LEFT JOIN residential_in_area B ON B.area_id = A.area_id
		WHERE A.area_id = `+area_id;
		return functions.selectQuery(sql);
	},
	getAssignedRepslist:function(area_id){
		// var sql = `SELECT A.user_id,B.image,B.first_name,B.last_name FROM sales_rep_regions A 
		// LEFT JOIN user_master B ON B.user_id = A.user_id
		// WHERE A.area_id = `+area_id;
		var sql = `SELECT A.user_id,B.image,B.first_name,B.last_name
		FROM sales_rep_regions A
		LEFT JOIN user_master B ON B.user_id = A.user_id
		WHERE FIND_IN_SET( `+area_id+`,A.area_id)`;
		return functions.selectQuery(sql);
	},
	getUserResidentialDetails:function(residential_id){
		var sql = `SELECT * FROM residential_data_master WHERE residential_id =  `+residential_id;
		return functions.selectQuery(sql);
	},
	getOppotunityCode:function(){
		var sql = `SELECT CONCAT('OP-',DATE_FORMAT(NOW(),'%m%d%y'),LPAD(COUNT(*)+1, 3, '0')) as opportunity_code
        FROM  opportunity_master WHERE  DATE(created_at)   =  DATE(NOW()) `;
		return functions.selectQuery(sql);
	},
	
	getUserCoordinates:function(user_id){
		var sql = `SELECT * FROM sales_rep_regions 
		WHERE user_id = '`+user_id+`'`;
		return functions.selectQuery(sql);
	},
	getLocations:function(latitude='',longitude=''){
		var sql = `SELECT A.residential_id,
		IFNULL(A.first_name,"") as first_name,
		IFNULL(A.last_name,"") as last_name,
		IFNULL(A.address_line1,"") as address_line1,
		IFNULL(A.address_line2,"") as address_line2,
		IFNULL(A.city,"") as city,
		IFNULL(A.state,"") as state,
		IFNULL(A.zip_code,"") as zip_code,
		IFNULL(A.latitude,"") as latitude,
		IFNULL(A.longitude,"") as longitude,
		IFNULL(C.status_type,1) as status,
		IFNULL(D.icon,'notcontacted') as icon,
		D.type,
		SQRT( POW(69.1 * (A.latitude - `+latitude+`), 2) + POW(69.1 * (`+longitude+` - A.longitude) * COS(A.latitude / 57.3), 2)) as distance
		FROM residential_data_master A 
		LEFT JOIN customer_master B ON B.residential_id = A.residential_id
		LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id
) C ON C.customer_id = B.customer_id 
		LEFT JOIN customer_status_types D ON D.id = C.status_type
		WHERE (SQRT( POW(69.1 * (A.latitude - `+latitude+`), 2) + POW(69.1 * (`+longitude+` - A.longitude) * COS(A.latitude / 57.3), 2))) < 10
		ORDER BY distance ASC
		`;
		

		// if(latitude != '' && longitude != ''){
		// 	sql += ` ,  SQRT( POW(69.1 * (A.latitude - "40.278847"), 2) + POW(69.1 * ("-74.617528" - A.longitude) * COS(A.latitude / 57.3), 2)) as distance`;
		// }

		//IF((SELECT count(*) FROM customer_master C WHERE C.residential_id = B.residential_id AND C.user_id = 84 AND C.dealer_id = 1 ), '1' , '0' ) as status`;

		return functions.selectQuery(sql);
	},
	getResDetails :function(residential_id){
		var sql = `SELECT 

		IFNULL(C.status_type,1) as status_type,
		IFNULL(D.type,"Not Contacted") as type,
		IFNULL(D.icon,'notcontacted') as icon,
		IFNULL(C.status_type,1) as status
		FROM customer_master B
		LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id
		) C ON C.customer_id = B.customer_id 
				LEFT JOIN customer_status_types D ON D.id = C.status_type
		WHERE B.residential_id = `+residential_id;
		return functions.selectQuery(sql);
	},
	getLocationDetails:function(residential_id,tableName,dealer_id){
		var sql = `SELECT A.consumer_id as residential_id,
		IFNULL(A.First_Name,"") as first_name,
		IFNULL(A.Last_Name,"") as last_name,
		IFNULL(A.Address,"") as address_line1,
		IFNULL(A.City,"") as city,
		IFNULL(A.State,"") as state,
		IFNULL(A.ZIP_Code,"") as zip_code,
		IFNULL(A.Latitude,"") as latitude,
		IFNULL(A.Longitude,"") as longitude,
		IFNULL(C.status_type,1) as status_type,
		B.email as email,
		B.phone_number as phone_no,
		B.secondary_phone_number as secondary_phone_no,
		DATE_FORMAT(C.visited_date,'%M %d,%Y') as date,
		IFNULL(D.type,"Not Contacted") as type,
		IFNULL(D.icon,'notcontacted') as icon,
		B.customer_id,
		IFNULL(C.status_type,1) as status,
		C.sub_status,
		IF(E.id != '','true','false') as ishomeowner
		FROM `+tableName+` A 
		LEFT JOIN customer_master B ON B.residential_id = A.consumer_id AND B.dealer_id = `+dealer_id+`
		LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id
) C ON C.customer_id = B.customer_id 
		LEFT JOIN customer_status_types D ON D.id = C.status_type
		LEFT JOIN customer_homeowner_master E ON E.latitude = A.Latitude AND E.longitude =A.Longitude AND E.dealer_id = `+dealer_id+`
		WHERE A.consumer_id = `+ residential_id ;
		
		//AND E.dealer_id = `+dealer_id+`
		return functions.selectQuery(sql);

	},
	
	getDistance:function(latitude,longitude,user_id){
		var sql = `SELECT *,SQRT( POW(69.1 * (A.latitude - `+latitude+`), 2) + POW(69.1 * (	`+longitude+` - A.longitude) * COS(A.latitude / 57.3), 2)) as distance 
		FROM user_latlng_log A
		WHERE A.user_id = ` + user_id;
		
		return functions.selectQuery(sql);
	},
	getStatus:function(latitude,longitude,user_id){
		var sql = `SELECT *,SQRT( POW(69.1 * (A.latitude - `+latitude+`), 2) + POW(69.1 * (	`+longitude+` - A.longitude) * COS(A.latitude / 57.3), 2)) as distance 
		FROM user_latlng_log A
		WHERE A.user_id = ` + user_id;
		
		return functions.selectQuery(sql);
	},

	getCustomerData:function(user_id){
		var sql = `SELECT * from consumer_data WHERE HOMEOWNER='Homeowner' 
		AND ( ZIP ='08558' OR ZIP ='08559' OR ZIP ='08560' OR ZIP ='08561'
		OR ZIP ='08562' 
		) AND processed != 'Y' LIMIT 1000`;
		
		return functions.selectQuery(sql);


	},
	getSaleRepLists:function(office_id,division_id,region_id,user_type,dealer_id=''){
		let cond = ' 1=1';
		if(office_id != '' && office_id != undefined && office_id != null ){
			cond+= ' AND A.office_id = '+office_id;
		}
		if(division_id != '' && division_id != undefined && division_id != null){
			cond+= ' AND A.division_id = '+division_id;
		}
		if(region_id != '' && region_id != undefined && region_id != null){
			cond+= ' AND A.region_id = '+region_id;
		}
		if(dealer_id != '' && dealer_id != undefined && dealer_id != null){
			cond+= ' AND A.dealer_id = '+dealer_id;
		}
		var sql = `SELECT A.user_id,A.email,A.first_name,A.last_name,A.image,A.address,A.city,A.phone,B.area_coordinates
		FROM user_master A 
		LEFT JOIN sales_rep_regions B ON B.user_id = A.user_id
		WHERE `+cond+` 
		AND A.user_type = 5 AND A.deleted_at IS NULL  GROUP BY A.user_id ORDER BY A.first_name ASC`;
		
		return functions.selectQuery(sql);
	},
	getFormBlocks:function(){
		var sql = `SELECT * FROM opportunity_fields_block WHERE is_response = 'N' ORDER BY display_order ASC`;
		return functions.selectQuery(sql);
	},
	getOpportunityFields:function(block_id){
		var sql = `SELECT B.type,B.mask,B.maskExpression,A.*,'' as value FROM opportunity_fields A 
		LEFT JOIN opportunity_fields_type B ON B.id = A.field_type_id 
		WHERE A.block_id = `+block_id+` AND A.active = 'Y' AND is_edit = 'Y' ORDER BY A.display_order ASC`;
		return functions.selectQuery(sql);
	},
	getLocationHistory:function(residential_id,latitude,longitude,tableName,dealer_id){
		var sql =` SELECT *
		FROM ( 
		SELECT B.*,C.first_name,C.last_name,DATE_FORMAT(B.visited_date,'%M %d,%Y') as date,
		'' as name,D.icon,'status_change' as type,B.visited_date as created
		FROM customer_master A
		LEFT JOIN customer_updates B ON B.customer_id = A.customer_id 
		LEFT JOIN user_master C ON C.user_id = B.user_id
		LEFT JOIN customer_status_types D ON D.id = B.status_type
		WHERE A.residential_id = `+residential_id+` AND A.dealer_id = `+dealer_id+`

		UNION

		SELECT '' as id,'' as user_id, '' as vertical_id, '' as customer_id, '' as message, '' as visited_date, '' as status_type, '' as sub_status,
		C.first_name,C.last_name,
		CONCAT(DATE_FORMAT(A.created_at,'%M %d,%Y')) as date,
		CONCAT( IF(A.residential_customer_id != '' ,E.First_Name,D.first_name),' ',IF(A.residential_customer_id != '' ,E.last_name,D.Last_Name)) as name,
		'homeowner' as icon,'create_homeowner' as type,A.created_at as created
		FROM customer_homeowner_history A
		LEFT JOIN user_master C ON C.user_id = A.user_id
		LEFT JOIN `+tableName+` D ON D.consumer_id = A.residential_id 
		LEFT JOIN residential_customers E ON E.residential_customer_id = A.residential_customer_id
		WHERE A.latitude = '`+latitude+`' AND A.longitude = '`+longitude+`' AND A.dealer_id = `+dealer_id+`
		
		UNION 

		SELECT '' as id,'' as user_id, '' as vertical_id, '' as customer_id, '' as message, '' as visited_date, '' as status_type, '' as sub_status,
                C.first_name,C.last_name,
                CONCAT(DATE_FORMAT(A.created_at,'%M %d,%Y')) as date,
                CONCAT( IF(A.residential_customer_id != '' ,A.First_Name,A.first_name),' ',IF(A.residential_customer_id != '' ,A.last_name,A.Last_Name)) as name,
                'person' as icon,'new_customer' as type,A.created_at as created
				FROM residential_customers A
				LEFT JOIN user_master C ON C.user_id = A.user_id

                WHERE A.latitude = '`+latitude+`' AND A.longitude = '`+longitude+`' AND A.dealer_id = `+dealer_id+`
		)  as T ORDER BY UNIX_TIMESTAMP(created) DESC
		`;
		
		// UNION 
		// SELECT '' as id,'' as user_id, '' as vertical_id, '' as customer_id, '' as message, '' as visited_date, '' as status_type, 
		// C.first_name,C.last_name,DATE_FORMAT(A.created_at,'%M %d,%Y') as date,'homeowner' as icon
		// FROM customer_homeowner_history A
		// LEFT JOIN user_master C ON C.user_id = A.user_id
		// WHERE A.residential_id =99236
		
		return functions.selectQuery(sql);
	},


	getAreaHistory:function(area_id,tableName,dealer_id ){
		var sql =` SELECT *
		FROM ( 
		
			SELECT B.*,C.first_name,C.last_name,DATE_FORMAT(B.visited_date,'%M %d,%Y') as date,D.icon,'status_change' as type,B.visited_date as created
			FROM customer_master A
			LEFT JOIN customer_updates B ON B.customer_id = A.customer_id 
			LEFT JOIN user_master C ON C.user_id = B.user_id
			LEFT JOIN customer_status_types D ON D.id = B.status_type
			WHERE  FIND_IN_SET( A.residential_id, ( SELECT B.residential_id FROM residential_in_area B WHERE B.area_id = `+area_id+` ) ) AND A.dealer_id = `+dealer_id+`

		UNION ALL

		SELECT '' as id,'' as user_id, '' as vertical_id, '' as customer_id, '' as message, '' as visited_date, '' as status_type,'' as sub_status, 
		C.first_name,C.last_name,
		CONCAT(DATE_FORMAT(A.created_at,'%M %d,%Y'), ' (' ,IF(A.residential_customer_id != '' ,E.First_Name,D.first_name),' ',IF(A.residential_customer_id != '' ,E.last_name,D.Last_Name), ')') as date,
		'homeowner' as icon,'create_homeowner' as type,A.created_at as created
		FROM customer_homeowner_history A
		LEFT JOIN user_master C ON C.user_id = A.user_id
		LEFT JOIN `+tableName+` D ON D.consumer_id = A.residential_id 
		LEFT JOIN residential_customers E ON E.residential_customer_id = A.residential_customer_id
		WHERE FIND_IN_SET( D.consumer_id, ( SELECT B.residential_id FROM residential_in_area B WHERE B.area_id = `+area_id+` ) ) AND A.dealer_id = `+dealer_id+`
		)  as T ORDER BY UNIX_TIMESTAMP(created) DESC
		`;
		
		// UNION 
		// SELECT '' as id,'' as user_id, '' as vertical_id, '' as customer_id, '' as message, '' as visited_date, '' as status_type, 
		// C.first_name,C.last_name,DATE_FORMAT(A.created_at,'%M %d,%Y') as date,'homeowner' as icon
		// FROM customer_homeowner_history A
		// LEFT JOIN user_master C ON C.user_id = A.user_id
		// WHERE A.residential_id =99236
		

		return functions.selectQuery(sql);
	},

	getCounts:function(user_id){
		var sql =`SELECT A.*,(SELECT count(*) FROM customer_updates B 
		WHERE B.status_type = A.id AND B.user_id = `+user_id+`) as count
		FROM customer_status_types A 
		WHERE A.id != 1 `;
		return functions.selectQuery(sql);
	},
	getUserProfileInfo:function(user_id){
		var sql =`SELECT B.visited_date,DATE_FORMAT(B.visited_date,'%M %d,%Y. %h:%i %p') as date_visited,A.*
		FROM user_master A 
		LEFT JOIN customer_updates B ON B.user_id = A.user_id
		WHERE A.user_id = `+user_id+`
		ORDER BY B.id DESC LIMIT 1`;
		return functions.selectQuery(sql);
	},
	getAddressDetailByID:function(residential_id,tableName){
		var sql =`SELECT A.consumer_id,A.consumer_id as residential_id,
		IFNULL(A.First_Name,"") as first_name,
		IFNULL(A.Last_Name,"") as last_name,
		IFNULL(A.Address,"") as address_line1,
		IFNULL(A.City,"") as city,
		IFNULL(A.State,"") as state,
		IFNULL(A.ZIP_Code,"") as zip_code,
		IFNULL(A.Latitude,"") as latitude,
		IFNULL(A.Longitude,"") as longitude,
		IFNULL(C.status_type,1) as status,
		IFNULL(D.icon,'notcontacted') as icon,
		D.type
		FROM `+tableName+` A 
		LEFT JOIN customer_master B ON B.residential_id = A.consumer_id
		LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 
		LEFT JOIN customer_updates T2 ON T1.id = T2.id) C ON C.customer_id = B.customer_id 
		LEFT JOIN customer_status_types D ON D.id = C.status_type
		WHERE A.consumer_id = `+residential_id ;
		return functions.selectQuery(sql);
	},
	getAppointments:function(residential_id,dealer_id){
		
		var sql =`SELECT DATE_FORMAT(A.start_date,'%Y-%m-%d') as start_date,DATE_FORMAT(A.start_date,'%H:%i:%s') as start_time,
		DATE_FORMAT(A.start_date,'%M %d,%Y. %h:%i %p') as date,CONCAT(DATE_FORMAT(A.start_date,'%Y-%m-%d'),'T',DATE_FORMAT(A.start_date,'%H:%i:%s'),'Z') as app_date,A.user_id,'' as image  
		FROM customer_appointments A 
		WHERE A.residential_id = `+residential_id +` AND A.dealer_id = `+dealer_id;
		return functions.selectQuery(sql);
	},
	getAvailableAreas:function(user_id,dealer_id){
		
		var sql =` SELECT A.*,IF(LENGTH(B.residential_id) = 0,0, (LENGTH(B.residential_id) - LENGTH(REPLACE(B.residential_id, ',', '')) + 1)) as total,
		(SELECT count(*) FROM customer_master C WHERE FIND_IN_SET(C.residential_id ,B.residential_id) AND C.dealer_id = `+dealer_id+` ) as home_interacted,
		ROUND(((SELECT count(*) FROM customer_master C WHERE FIND_IN_SET(C.residential_id ,B.residential_id) AND C.dealer_id = `+dealer_id+` ) / ( IF(LENGTH(B.residential_id) = 0,0, (LENGTH(B.residential_id) - LENGTH(REPLACE(B.residential_id, ',', '')) + 1))))*100) as percentage 
		FROM manager_regions A
		LEFT JOIN residential_in_area B ON B.area_id = A.area_id
		WHERE FIND_IN_SET ( A.area_id , ( 
			SELECT GROUP_CONCAT(B.area_id) FROM sales_rep_regions B WHERE B.user_id = `+user_id+` GROUP BY B.user_id ) ) `;
		
		return functions.selectQuery(sql);
	},
	
	getNotes:function(residential_id, dealer_id){
		var sql =`SELECT A.notes,A.residential_id,DATE_FORMAT(A.created_date,'%M %d,%Y') as date 
		FROM customer_notes A 
		WHERE A.residential_id =`+residential_id+` AND A.dealer_id = `+dealer_id+` ORDER BY A.created_date DESC`;
		return functions.selectQuery(sql);
	},
	getCustomers:function(latitude,longitude,tableName,dealer_id){
		var sql =`SELECT A.consumer_id as residential_id,
		A.consumer_id,
		A.First_Name as first_name,
		A.Last_Name as last_name,
		A.Gender,
		A.Address as address_line1,
		A.City as city,
		A.State as state,
		A.ZIP_Code as zip_code,
		A.NumMbrs_HH,
		A.Age,
		A.Year_Month_Of_Birth,
		A.Income_Code,
		A.Length_Of_Residence,
		A.Own_Rent,
		A.Location_Type_Code,
		A.Home_Size,
		A.Latitude as latitude,
		A.Longitude as longitude,
		A.WEALTHFINDER_CODE,
		A.WEALTHFINDER_DESCRIPTION,
		IFNULL(C.status_type,1) as status_type,
		B.email as email,
		B.phone_number as phone_no,
		B.secondary_phone_number as secondary_phone_no,
		DATE_FORMAT(C.visited_date,'%M %d,%Y') as date,
		IFNULL(D.type,"Not Contacted") as type,
		IFNULL(D.icon,'notcontacted') as icon,
		B.customer_id,
		IFNULL(C.status_type,1) as status,
		IF(E.id != '',(IF(E.residential_customer_id !='','false','true')),'false') as ishomeowner,
		'' as residential_customer_id
		FROM `+tableName+` A 
		LEFT JOIN customer_master B ON B.residential_id = A.consumer_id AND B.dealer_id = `+dealer_id+`
		LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id ) C ON C.customer_id = B.customer_id 
		LEFT JOIN customer_status_types D ON D.id = C.status_type
		LEFT JOIN customer_homeowner_master E ON E.residential_id = A.consumer_id AND E.dealer_id = `+dealer_id+`

		WHERE A.Latitude = '`+latitude+`' AND A.Longitude = '`+longitude+`'
			
		UNION

		SELECT A.residential_id,
		'' as consumer_id,
		A.first_name,
		A.last_name,
		A.Gender,
		A.address as address_line1,
		A.city,
		A.state,
		A.zipcode as zip_code,
		A.NumMbrs_HH,
		A.Age,
		'' as Year_Month_Of_Birth,
		A.Income_Code,
		A.Length_Of_Residence,
		A.Own_Rent as own_Rent,
		A.Location_Type_Code,
		A.Home_Size,
		A.latitude,
		A.longitude,

		A.WEALTHFINDER_CODE,
		A.WEALTHFINDER_DESCRIPTION,

					
		IFNULL(C.status_type,1) as status_type,
				A.email as email,
				A.phone_number as phone_no,
				A.secondory_phone_number as secondary_phone_no,
				DATE_FORMAT(C.visited_date,'%M %d,%Y') as date,
				IFNULL(D.type,"Not Contacted") as type,
				IFNULL(D.icon,'notcontacted') as icon,
				B.customer_id,
				IFNULL(C.status_type,1) as status,
				IF(E.id != '','true','false') as ishomeowner,
		A.residential_customer_id

		FROM residential_customers A
		LEFT JOIN customer_master B ON B.residential_id = A.residential_id
		LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id
		) C ON C.customer_id = B.customer_id 
				LEFT JOIN customer_status_types D ON D.id = C.status_type
				LEFT JOIN customer_homeowner_master E ON E.residential_customer_id = A.residential_customer_id AND E.dealer_id = `+dealer_id+`
		WHERE A.Latitude = '`+latitude+`' AND A.Longitude = '`+longitude+`' AND A.dealer_id = `+dealer_id;
		
		return functions.selectQuery(sql);
	},
	getMyAppointments:function(user_id,tableName){
		var sql =`SELECT DATE_FORMAT(A.start_date,'%Y-%m-%d') as start_date,DATE_FORMAT(A.start_date,'%H:%i:%s') as start_time,
		DATE_FORMAT(A.start_date,'%M %d,%Y. %h:%i %p') as date,A.user_id,A.residential_id,B.First_Name as first_name,B.Last_Name as last_name,'' as image,A.latitude,A.longitude,A.location
		FROM customer_appointments A 
		LEFT JOIN `+tableName+` B ON B.consumer_id = A.residential_id
		WHERE A.user_id = `+user_id+` ORDER BY A.created_date DESC
		`;
		return functions.selectQuery(sql);
	},
	getUserDetails:function(user_id){
		var sql =`SELECT A.email,A.first_name,A.last_name,A.image,A.address,A.phone,C.office_title as office_name  
		FROM user_master A 
		LEFT JOIN dealer_office C ON C.office_id = A.office_id
		WHERE A.user_id = `+user_id;
		return functions.selectQuery(sql);
	},
	getUserHistory:function(user_id,tableName){
		var sql =`SELECT * FROM (SELECT A.residential_id,A.first_name,A.last_name,A.email,A.phone_number,A.address,B.status_type,B.sub_status,
			DATE_FORMAT(B.visited_date,'%M %d,%Y') as visited_date,DATE_FORMAT(B.visited_date,'%M %d,%Y') as date,
	'' as name,
			IFNULL(C.icon,'notcontacted') as icon,C.type,B.visited_date as created
			FROM customer_master A 
			LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id
			) B ON B.customer_id = A.customer_id 
			LEFT JOIN customer_status_types C ON C.id = B.status_type
			WHERE A.user_id = '${user_id}'  AND A.residential_id != '' 
	
	UNION 
	
	SELECT A.residential_id,
					C.first_name,C.last_name,'' as email, '' as phone_number,'' as address,'' as status_type,'' as sub_status,
	DATE_FORMAT(A.created_at,'%M %d,%Y') as visited_date,
					CONCAT(DATE_FORMAT(A.created_at,'%M %d,%Y')) as date,
					CONCAT( IF(A.residential_customer_id != '' ,E.First_Name,D.first_name),' ',IF(A.residential_customer_id != '' ,E.last_name,D.Last_Name)) as name, 
									'homeowner' as icon,'create_homeowner' as type,A.created_at as created
					FROM customer_homeowner_history A
					LEFT JOIN user_master C ON C.user_id = A.user_id
					LEFT JOIN `+tableName+`  D ON D.consumer_id = A.residential_id
					LEFT JOIN residential_customers E ON E.residential_customer_id = A.residential_customer_id
					WHERE A.user_id = '${user_id}' 
					
					UNION
					SELECT A.residential_id,
										C.first_name,C.last_name,'' as email, '' as phone_number,'' as address,'' as status_type,'' as sub_status,
						DATE_FORMAT(A.created_at,'%M %d,%Y') as visited_date,
										CONCAT(DATE_FORMAT(A.created_at,'%M %d,%Y')) as date,
					CONCAT( A.First_Name,' ',A.Last_Name) as name, 
									'person' as icon,'create_homeowner' as type,A.created_at as created
					FROM residential_customers A
					LEFT JOIN user_master C ON C.user_id = A.user_id
					WHERE A.user_id =  '${user_id}'  



					) as T ORDER BY UNIX_TIMESTAMP(created) DESC`;
		// var sql =`SELECT A.residential_id,A.first_name,A.last_name,A.email,A.phone_number,A.address,B.status_type,
		// DATE_FORMAT(B.visited_date,'%M %d,%Y') as visited_date,DATE_FORMAT(B.visited_date,'%M %d,%Y') as date,
		// IFNULL(C.icon,'notcontacted') as icon,C.type
		// FROM customer_master A 
		// LEFT JOIN ( SELECT T2.* FROM ( SELECT MAX(id) as id from customer_updates GROUP BY customer_id ) T1 LEFT JOIN customer_updates T2 ON T1.id = T2.id
		// ) B ON B.customer_id = A.customer_id 
		// LEFT JOIN customer_status_types C ON C.id = B.status_type
		// WHERE A.user_id =  `+user_id+` AND A.residential_id != '' ORDER BY B.visited_date DESC`;
		return functions.selectQuery(sql);
	},
	getVerticals:function(dealer_id){
		var sql =`SELECT A.vertical_id,A.title,A.prospect_image as image,IF(id != '','true','false') as status FROM vertical_master A 
		LEFT JOIN map_dealer_vertical B ON B.vertical_id = A.vertical_id 
		AND B.dealer_id = `+dealer_id+` AND B.product_id = 2`;
		return functions.selectQuery(sql);
	},
	getAvailableOffices:function(user_id,dealer_id, office_id,division_id,region_id,user_type ){
		let cond = '  1=1';
		if(user_type == 4){
			cond+= ' AND A.office_id = '+office_id;
		}else if(user_type == 6){
			cond+= ' AND A.division_id = '+division_id;
		}else if(user_type == 7){
			cond+= ' AND A.region_id = '+region_id;
		}
		
		var sql =`SELECT *,IF((SELECT B.office_id FROM user_master B WHERE B.user_id = `+user_id+`) = A.office_id, 'true','false') as current_office 
		FROM dealer_office A 
		WHERE `+cond +` AND A.dealer_id = `+dealer_id;
		
		return functions.selectQuery(sql);
	},
	getManagersList:function(office_id){
		var sql =`SELECT user_id,email,first_name,last_name,image,address,city  
		FROM user_master 
		WHERE ( user_type= 4 OR user_type= 6 OR user_type = 7) AND office_id = `+office_id;
		return functions.selectQuery(sql);
	},
	getMessages:function(sender_id,receiver_id){
		var sql =`SELECT A.*,DATE_FORMAT(created_at,'%M %d,%Y %h:%i %p') as ago,
		IF( (UNIX_TIMESTAMP(NOW())- UNIX_TIMESTAMP(created_at))/60 > 60,
		IF( (UNIX_TIMESTAMP(NOW())- UNIX_TIMESTAMP(created_at))/3600 > 24,
		CONCAT( TRUNCATE((UNIX_TIMESTAMP(NOW())- UNIX_TIMESTAMP(created_at))/86400,0)  ,' days ago'),
		CONCAT( TRUNCATE((UNIX_TIMESTAMP(NOW())- UNIX_TIMESTAMP(created_at))/3600,0)  ,' hourse ago') ),
		CONCAT( TRUNCATE((UNIX_TIMESTAMP(NOW())- UNIX_TIMESTAMP(created_at))/60,0)  ,' minutes ago')) as date 
		FROM message_master A
		WHERE (A.sender_id = `+sender_id+` AND A.receiver_id = `+receiver_id+` ) OR (A.sender_id = `+receiver_id+` AND A.receiver_id = `+sender_id+`)
		ORDER BY created_at ASC `;
		return functions.selectQuery(sql);
	},
	getHomeOwnerData:function(residential_id,latitude,longitude,dealer_id){
		var sql =`SELECT * FROM customer_homeowner_master A 
		WHERE A.latitude = '`+latitude+`' AND A.longitude = '`+longitude+`' AND A.dealer_id = `+dealer_id;
		return functions.selectQuery(sql);
	},
	searchByAddress:function(keyword,tableName){
		
		var sql =`SELECT CONCAT(Address,' ',City,',',State) as Address,consumer_id,consumer_id as residential_id,City,CONCAT('US-',State) as State,Latitude as latitude,Longitude as longitude  
		FROM `+tableName+` 
		WHERE Address LIKE '%`+keyword+`%'`;
		
		return functions.selectQuery(sql);
	},

	checkCustomerExist:function(email,phone,first_name,last_name,dealer_id){
		
		var sql =`SELECT A.* FROM customer_master A
		INNER JOIN opportunity_master B ON B.customer_id = A.customer_id
		WHERE (( A.first_name = '`+first_name+`' AND A.last_name ='`+last_name+`' AND A.email = '`+email+`' ) 
		OR ( A.first_name = '`+first_name+`' AND A.last_name ='`+last_name+`' AND A.phone_number = '`+phone+`') ) AND A.dealer_id = `+dealer_id+
		` AND B.vertical_id = 1  AND B.fulfilment_partner_id = 1 AND B.active = 'Y' `;
		
		return functions.selectQuery(sql);
	},

	
}

module.exports = userModel;

