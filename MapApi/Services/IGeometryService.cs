using MapApi.Dtos;

namespace MapApi.Services
{
    public interface IGeometryService
    {
        Task<List<GeometryListDto>> GetAllAsync();
        Task<GeometryListDto> CreateAsync(CreateGeometryDto createGeometryDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateGeometryAsync(int id, UpdateGeometryDto updateGeometryDto);
    }
}
