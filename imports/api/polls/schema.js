import SimpleSchema from 'simpl-schema';

const PollSchema = new SimpleSchema({
    eventId: String,
    name: String,
    type: String,
    active: Boolean,
    url: String,

});

const MCQSchema = new SimpleSchema({
    maxOptions: SimpleSchema.Integer,
    options: [String],
    answer: String
})

const RattingSchema = new SimpleSchema({
    question: String,
    description: {
        type: String,
        optional: true
    },
    rating: Number
});

export {
    PollSchema, MCQSchema, RattingSchema
}