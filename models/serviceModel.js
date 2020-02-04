let functions = require('../helpers/functions');
//config = require('.././server/config');

let userModel = {
	

  	getGuides:function(user_type,platform,category_id,search_key){      
 
            var sql = `SELECT G.id,G.title,G.desc,G.file_type,G.file_path,G.file_image,G.available_for_managers,G.available_for_rep,G.available_for_dealer_admin		
            FROM setup_guide G`;
            if(platform=='prospect_web'){
                sql += ` where G.available_for_prospect_web='Y'`;
                
            }else{
                sql += ` where G.available_for_prospect_ios='Y'`;
            } 
            if(user_type=='5'){
                sql += ` AND G.available_for_rep='Y'`;
                
            }
            else if(user_type=='4' || user_type=='6' || user_type=='7'){
                sql += ` AND (G.available_for_managers='Y' || G.available_for_rep='Y')`;
                
            }else if(user_type=='3'){
                sql += ` AND (G.available_for_dealer_admin='Y' || G.available_for_managers='Y' || G.available_for_rep='Y')`;
            }else{
                sql += ``;  
            } 
            if(category_id!='' && category_id!=undefined) {
                sql += ` AND G.category_id=${category_id}`;
            }
            if(search_key!='' && search_key!=undefined) {
                sql += ` AND G.title LIKE '%${search_key}%'`;
            }

            sql += ` AND G.deleted_at IS NULL`;
            return functions.selectQuery(sql);	
	}, 



	getGuideCategories:function(user_type,platform){        
 
            var sql = `SELECT category_id,title
            FROM setup_guide_category where active='Y' order by title ASC`;           
            console.log(sql);
            return functions.selectQuery(sql);
		
		
	},
	


	getTicketCode:function(){        
 
            var sql = `SELECT CONCAT('TKT',DATE_FORMAT(NOW(),'%m%d%y'),LPAD(COUNT(*)+1, 3, '0')) as ticket_code
			FROM  ticket_master WHERE  DATE(created_at)   =  DATE(NOW()) `;           
            return functions.selectQuery(sql);
		
		
	},
	
	getTickets:function(user_id,search_key){ 	
 
            var sql = `SELECT T.ticket_id,T.ticket_code,T.title,T.description,T.filename,T.file as image_url,T.image_url as thumb_url,T.ticket_status,T.file_type,DATE_FORMAT(T.created_at,'%M %d,%Y %h:%i %p') as created_at,IF(C.comments IS NULL, 0, C.comments) AS comments
			FROM  ticket_master T LEFT JOIN (select count(t_comment_id) as comments,ticket_id from ticket_comments GROUP BY ticket_id) AS C ON C.ticket_id=T.ticket_id WHERE  user_id   =  ${user_id} `;           
			if(search_key!='' && search_key!=undefined) {
                sql += ` AND (T.title LIKE '%${search_key}%' OR T.ticket_code LIKE '%${search_key}%') `;
            }
            sql += ` order by ticket_id DESC`;
			return functions.selectQuery(sql);	
		
    },
    
    getTicketsCount:function(user_id){ 	
 
        var sql = `SELECT COUNT(ticket_id) as ticket_count 
        FROM  ticket_master WHERE  user_id  =  ${user_id} `;          
        console.log(sql);
        return functions.selectQuery(sql);	
    
    },
	
	getComments:function(ticket_id){        
 
            var sql = `SELECT T.*,DATE_FORMAT(T.created_at,'%M %d,%Y %h:%i %p') as created_at,U.first_name,U.last_name,T.user_id
			FROM  ticket_comments T LEFT JOIN user_master U ON U.user_id=T.user_id WHERE  T.ticket_id = ${ticket_id} `;           
            return functions.selectQuery(sql);
		
		
	},

    getComment:function(comment_id){        
 
            var sql = `SELECT T.comment,DATE_FORMAT(T.created_at,'%M %d,%Y %h:%i %p') as created_at,U.first_name,U.last_name,T.user_id
			FROM  ticket_comments T LEFT JOIN user_master U ON U.user_id=T.user_id WHERE  T.t_comment_id = ${comment_id} `;           
            return functions.selectQuery(sql);
		
		
	},

    getTicketUser:function(ticket_id){        
 
            var sql = `select user_master.first_name,user_master.last_name,ticket_master.title,ticket_master.ticket_code,ticket_master.platform,ticket_master.description  FROM ticket_master LEFT JOIN user_master ON ticket_master.user_id=user_master.user_id WHERE ticket_id = ${ticket_id} `;           
            return functions.selectQuery(sql);
		
		
    },
    
    getOppty:function(dealer_id){
        var sql = `SELECT is_opportunity_enabled
        FROM dealer_master where dealer_id=${dealer_id}`;
        console.log(sql);
        return functions.selectQuery(sql);
        },
    getAppointment:function(appointment_id,dealer_id){		
            var sql =`SELECT A.id as appointment_id,A.notes,A.customer_name,A.customer_email,A.customer_phone,DATE_FORMAT(A.start_date,'%Y-%m-%d') as start_date,DATE_FORMAT(A.start_date,'%H:%i:%s') as start_time,
            DATE_FORMAT(A.start_date,'%M %d,%Y. %h:%i %p') as date,CONCAT(DATE_FORMAT(A.start_date,'%Y-%m-%d'),'T',DATE_FORMAT(A.start_date,'%H:%i:%s'),'Z') as app_date,A.user_id,'' as image,A.customer_name, A.timezone,A.selected_date,
            DATE_FORMAT(A.selected_date,'%M %d,%Y. %h:%i %p') as timezone_date ,
            CONCAT(B.first_name,' ',B.last_name) as name   
            FROM customer_appointments A 
            LEFT JOIN user_master B ON B.user_id = A.user_id
            WHERE A.id = `+appointment_id;
            return functions.selectQuery(sql);
        },    




	













	
}

module.exports = userModel;

