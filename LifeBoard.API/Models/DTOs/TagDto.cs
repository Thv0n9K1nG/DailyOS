using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class TagDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6B7280";
}

public class CreateTagDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6B7280";
}

public class UpdateTagDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6B7280";
}

public class CreateTagDtoValidator : AbstractValidator<CreateTagDto>
{
    public CreateTagDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Color).NotEmpty().Matches("^#(?:[0-9a-fA-F]{3}){1,2}$").WithMessage("Color must be a valid hex code.");
    }
}

public class UpdateTagDtoValidator : AbstractValidator<UpdateTagDto>
{
    public UpdateTagDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Color).NotEmpty().Matches("^#(?:[0-9a-fA-F]{3}){1,2}$").WithMessage("Color must be a valid hex code.");
    }
}
