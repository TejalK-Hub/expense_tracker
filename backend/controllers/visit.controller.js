const visitService = require('../services/visit.service');

const createVisit = async (req, res) => {
    try{
        const data = {
            user_id : req.user.id,
            visit_reason_id : req.body.visit_reason_id,
            start_date : req.body.start_date,
            end_date : req.body.end_date
        }

        const visit = await visitService.createVisit(data);

        res.json ({
            success: true,
            data: visit
        })
    }

    catch(error) {
        console.error('Visit creation error: ', error);

        res.status(500).json({
            success: false,
            message : 'Internal Server Error'
        })
    }

}



