import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
    student: {
        name: {
            type: String,
            required: true
        },
        indexNumber: {
            type: String,
            required: true
        }
    },
    class: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(Grade-\d{1,2}-[A-F]|A\/L-[a-z-]+)$/i.test(v);
            },
            message: props => `${props.value} is not a valid class format! Use Grade-6-A or A/L-stream format`
        }
    },
    term: {
        type: String,
        required: true,
        enum: ['Term 1', 'Term 2', 'Term 3']
    },
    subjects: [{
        subject: {
            type: String,
            required: true
        },
        marks: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        totalMarks: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        }
    }],
    academicYear: {
        type: String,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Mark', markSchema);
